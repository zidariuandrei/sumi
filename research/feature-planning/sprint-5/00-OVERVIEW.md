# Sprint 5: Format Expansion (Comics & Docs)

**Goal:** Reach parity with Readera's format support by adding Comics and legacy ebook formats.

## Features
- **CBZ/CBR Support**: Using `libarchive` or `zip.js` to extract images and display them in a "Manga/Comic" optimized viewer.
- **Manga Mode**: Support for Right-to-Left (RTL) reading direction.
- **MOBI/AZW3**: Integration with `kindle-unpack` logic to read non-DRM Kindle files.
- **FB2/TXT**: Minimalist viewers for structured and unstructured text files.
- **Vertical Scroll Mode**: Continuous scrolling option for all text-based formats.
