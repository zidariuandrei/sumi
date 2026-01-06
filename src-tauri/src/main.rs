// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use epub::doc::EpubDoc;
use lopdf::{Document, Object};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(serde::Serialize)]
struct BookMetadata {
    title: Option<String>,
    author: Option<String>,
}

fn decode_pdf_text(bytes: &[u8]) -> String {
    // Check for UTF-16BE BOM (FE FF)
    if bytes.len() >= 2 && bytes[0] == 0xFE && bytes[1] == 0xFF {
        let u16_chars: Vec<u16> = bytes[2..]
            .chunks_exact(2)
            .map(|chunk| u16::from_be_bytes([chunk[0], chunk[1]]))
            .collect();
        return String::from_utf16_lossy(&u16_chars);
    }
    
    // Fallback: try UTF-8, then treat as Latin1 (ISO-8859-1)
    match std::str::from_utf8(bytes) {
        Ok(s) => s.to_string(),
        Err(_) => bytes.iter().map(|&b| b as char).collect(),
    }
}

#[tauri::command]
fn get_metadata(file_path: String) -> Result<BookMetadata, String> {
    let path_buf = PathBuf::from(&file_path);
    if !path_buf.exists() {
        return Err("File does not exist".to_string());
    }

    if file_path.to_lowercase().ends_with(".epub") {
        let mut doc = EpubDoc::new(&file_path).map_err(|e| e.to_string())?;
        return Ok(BookMetadata {
            title: doc.mdata("title").map(|m| m.value.clone()),
            author: doc.mdata("creator").map(|m| m.value.clone()),
        });
    }

    if file_path.to_lowercase().ends_with(".pdf") {
        let doc = Document::load(&file_path).map_err(|e| e.to_string())?;
        
        // Try to get Info dictionary from trailer
        if let Ok(info_id) = doc.trailer.get(b"Info").and_then(|obj| obj.as_reference()) {
            if let Ok(info) = doc.get_dictionary(info_id) {
                let title = info.get(b"Title")
                    .ok()
                    .and_then(|o| o.as_str().ok())
                    .map(|s| decode_pdf_text(s));
                
                let author = info.get(b"Author")
                    .ok()
                    .and_then(|o| o.as_str().ok())
                    .map(|s| decode_pdf_text(s));

                return Ok(BookMetadata { title, author });
            }
        }
        
        return Ok(BookMetadata { title: None, author: None });
    }

    Err("Unsupported file type".to_string())
}

#[tauri::command]
fn get_cover(app_handle: AppHandle, file_path: String) -> Result<String, String> {
    println!("Extracting cover for: {}", file_path);
    
    let path_buf = PathBuf::from(&file_path);
    if !path_buf.exists() {
        return Err("File does not exist".to_string());
    }

    // Generate a unique filename based on the file path hash
    let mut hasher = Sha256::new();
    hasher.update(file_path.as_bytes());
    let result = hasher.finalize();
    let hash_string = hex::encode(result);
    
    // Setup cache directory
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let covers_dir = app_data_dir.join("covers");
    if !covers_dir.exists() {
        fs::create_dir_all(&covers_dir).map_err(|e| e.to_string())?;
    }

    // Check if cover already exists
    // We assume .jpg for cache for simplicity, though we could store mime type
    let cover_path = covers_dir.join(format!("{}.jpg", hash_string));
    
    if cover_path.exists() {
        let data = fs::read(&cover_path).map_err(|e| e.to_string())?;
        let b64 = general_purpose::STANDARD.encode(data);
        // Assuming jpeg for cached files for now
        return Ok(format!("data:image/jpeg;base64,{}", b64));
    }

    // Logic for EPUB
    if file_path.to_lowercase().ends_with(".epub") {
        let mut doc = EpubDoc::new(&file_path).map_err(|e| e.to_string())?;
        
        // Strategy 1: Standard metadata
        if let Some(cover_data) = doc.get_cover() {
             let (data, mime) = cover_data;
             
             let mut file = fs::File::create(&cover_path).map_err(|e| e.to_string())?;
             file.write_all(&data).map_err(|e| e.to_string())?;
             
             let b64 = general_purpose::STANDARD.encode(data);
             return Ok(format!("data:{};base64,{}", mime, b64));
        }

        // Strategy 2: Fallback search in resources
        // Look for resources with "cover" in the ID and an image mime type
        let cover_id = doc.resources.keys()
            .find(|k| {
                let k_lower = k.to_lowercase();
                if let Some(resource) = doc.resources.get(*k) {
                    (k_lower.contains("cover") || k_lower.contains("jacket")) && resource.mime.starts_with("image/")
                } else {
                    false
                }
            })
            .cloned();

        if let Some(id) = cover_id {
             if let Some((data, mime)) = doc.get_resource(&id) {
                 let mut file = fs::File::create(&cover_path).map_err(|e| e.to_string())?;
                 file.write_all(&data).map_err(|e| e.to_string())?;
                 
                 let b64 = general_purpose::STANDARD.encode(&data);
                 return Ok(format!("data:{};base64,{}", mime, b64));
             }
        }
        
        return Err("No cover found in EPUB".to_string());
    }
    
    // Logic for PDF
    if file_path.to_lowercase().ends_with(".pdf") {
        let doc = Document::load(&file_path).map_err(|e| e.to_string())?;
        
        // Get first page reference. 
        // Note: get_pages returns a BTreeMap<u32, (u32, u16)> where keys are page numbers (1-based)
        let pages = doc.get_pages();
        let first_page_id = *pages.values().next().ok_or("No pages found")?;
        
        // Get page object
        let page = doc.get_dictionary(first_page_id).map_err(|e| e.to_string())?;
        
        // Get Resources
        let resources = page.get(b"Resources")
            .and_then(|obj| match obj {
                Object::Reference(id) => doc.get_dictionary(*id),
                Object::Dictionary(dict) => Ok(dict),
                _ => Err(lopdf::Error::Type),
            })
            .map_err(|_| "No resources found on first page")?;

        // Get XObject
        let xobjects = resources.get(b"XObject")
             .and_then(|obj| match obj {
                Object::Reference(id) => doc.get_dictionary(*id),
                Object::Dictionary(dict) => Ok(dict),
                _ => Err(lopdf::Error::Type),
            })
            .map_err(|_| "No XObjects found on first page")?;
            
        // Iterate through XObjects to find a suitable Image
        for (_name, object) in xobjects.iter() {
            let id = match object {
                Object::Reference(id) => *id,
                _ => continue,
            };
            
            if let Ok(stream) = doc.get_object(id).and_then(|o| o.as_stream()) {
                // Check if it's an image
                if let Ok(subtype) = stream.dict.get(b"Subtype") {
                    if let Ok("Image") = subtype.as_name_str() {
                        // Check filters. We want DCTDecode (JPEG) for direct extraction.
                        let is_jpeg = if let Ok(filter) = stream.dict.get(b"Filter") {
                            match filter {
                                Object::Name(name) => name == b"DCTDecode",
                                Object::Array(arr) => arr.iter().any(|x| matches!(x.as_name_str(), Ok("DCTDecode"))),
                                _ => false,
                            }
                        } else {
                            false
                        };
                        
                        if is_jpeg {
                             // It's a JPEG, we can just dump the raw content
                             let data = stream.content.clone();
                             let mut file = fs::File::create(&cover_path).map_err(|e| e.to_string())?;
                             file.write_all(&data).map_err(|e| e.to_string())?;
                             
                             let b64 = general_purpose::STANDARD.encode(&data);
                             return Ok(format!("data:image/jpeg;base64,{}", b64));
                        }
                    }
                }
            }
        }
        
        return Err("No suitable JPEG cover found in PDF".to_string());
    }

    Err("Unsupported file type or no cover found".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_cover, get_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}