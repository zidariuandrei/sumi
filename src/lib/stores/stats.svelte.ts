import { browser } from '$app/environment';
import { type BookStatistics } from '$lib/types/reader';
import { storage, STORAGE_KEYS } from '$lib/utils/storage';

interface CurrentSession {
    bookPath: string;
    startTime: number;
    accumulatedMs: number;
    lastResumeTime: number | null; // null means paused
    counted: boolean; // whether this session has been added to sessionCount
}

class ReadingStatsStore {
    stats = $state<Record<string, BookStatistics>>({});
    private currentSession = $state<CurrentSession | null>(null);
    private saveInterval: ReturnType<typeof setInterval> | null = null;
    private readonly AUTO_SAVE_INTERVAL = 30000;
    private readonly MIN_SESSION_DURATION_MS = 5000;

    constructor() {
        if (browser) {
            this.stats = storage.get(STORAGE_KEYS.READING_STATS, {});
            
            // Handle visibility change
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            
            // Also save on beforeunload
            window.addEventListener('beforeunload', () => {
                this.endSession();
            });
        }
    }

    startSession(bookPath: string): void {
        // If there's an active session for a different book, end it
        if (this.currentSession) {
            if (this.currentSession.bookPath === bookPath) {
                // Already tracking this book, just ensure we are resumed
                if (this.currentSession.lastResumeTime === null) {
                    this.resumeSession();
                }
                return;
            }
            this.endSession();
        }

        const now = Date.now();
        this.currentSession = {
            bookPath,
            startTime: now,
            accumulatedMs: 0,
            lastResumeTime: now,
            counted: false
        };

        this.startAutoSave();
    }

    endSession(): void {
        if (!this.currentSession) return;

        // Perform final update
        this.updateStats();

        // Clear session
        this.currentSession = null;
        this.stopAutoSave();
        
        // Persist final state
        this.save();
    }

    private updateStats(): void {
        if (!this.currentSession) return;

        const now = Date.now();
        let deltaMs = 0;

        // Calculate time since last update/resume
        if (this.currentSession.lastResumeTime !== null) {
            deltaMs = now - this.currentSession.lastResumeTime;
            this.currentSession.lastResumeTime = now; // Reset for next tick
        }

        this.currentSession.accumulatedMs += deltaMs;

        // Only record if total duration exceeds threshold
        if (this.currentSession.accumulatedMs >= this.MIN_SESSION_DURATION_MS) {
            const path = this.currentSession.bookPath;
            
            // Initialize stats entry if missing
            if (!this.stats[path]) {
                this.stats[path] = {
                    bookPath: path,
                    totalTime: 0,
                    sessionCount: 0,
                    firstOpened: this.currentSession.startTime,
                    lastRead: now
                };
            }

            const stat = this.stats[path];

            // Increment session count once per valid session
            if (!this.currentSession.counted) {
                stat.sessionCount = (stat.sessionCount || 0) + 1;
                this.currentSession.counted = true;
            }

            // Update total time (convert delta to seconds)
            // We use delta here to increment incrementally
            if (deltaMs > 0) {
                stat.totalTime = (stat.totalTime || 0) + (deltaMs / 1000);
            }
            
            stat.lastRead = now;
            
            // Force reactivity update if needed
            this.stats[path] = stat;
        }
    }

    private startAutoSave(): void {
        if (this.saveInterval) clearInterval(this.saveInterval);
        this.saveInterval = setInterval(() => {
            this.updateStats();
            this.save();
        }, this.AUTO_SAVE_INTERVAL);
    }

    private stopAutoSave(): void {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    }

    private handleVisibilityChange = () => {
        if (document.hidden) {
            this.pauseSession();
        } else {
            this.resumeSession();
        }
    };

    private pauseSession(): void {
        if (!this.currentSession || this.currentSession.lastResumeTime === null) return;
        
        // Update stats up to this moment
        this.updateStats();
        
        // Mark as paused
        this.currentSession.lastResumeTime = null;
        this.save(); // Save when pausing (hiding app)
    }

    private resumeSession(): void {
        if (!this.currentSession || this.currentSession.lastResumeTime !== null) return;
        
        // Resume
        this.currentSession.lastResumeTime = Date.now();
    }

    private save(): void {
        if (browser) {
            storage.set(STORAGE_KEYS.READING_STATS, this.stats);
        }
    }

    getReadingTimeForBook(bookPath: string): number {
        return this.stats[bookPath]?.totalTime || 0;
    }

    formatDuration(seconds: number): string {
        if (!seconds || seconds < 0) return '0m';
        
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        
        if (h > 0) {
            return `${h}h ${m}m`;
        }
        return `${m}m`;
    }

    cleanup(): void {
        if (browser) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        this.endSession();
    }
}

export const readingStatsStore = new ReadingStatsStore();
