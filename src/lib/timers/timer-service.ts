"use client";

/**
 * Timer status
 */
export type TimerStatus = "running" | "paused" | "completed" | "dismissed";

/**
 * Individual timer
 */
export interface Timer {
  id: string;
  taskId: string;
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  createdAt: number;
  pausedAt?: number;
}

/**
 * Timer event listener
 */
export type TimerEventListener = (timers: Timer[]) => void;

/**
 * Generate unique ID
 */
function generateId(): string {
  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Timer Service
 *
 * Manages multiple countdown timers with persistence and audio alerts.
 * Runs entirely client-side - no network needed.
 */
class TimerServiceImpl {
  private timers: Map<string, Timer> = new Map();
  private intervals: Map<string, number> = new Map();
  private listeners: Set<TimerEventListener> = new Set();
  private audioContext: AudioContext | null = null;

  /**
   * Subscribe to timer updates
   */
  subscribe(listener: TimerEventListener): () => void {
    this.listeners.add(listener);
    // Immediately send current state
    listener(this.getActiveTimers());
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Start a new timer
   */
  startTimer(taskId: string, label: string, durationMinutes: number): string {
    const id = generateId();
    const durationSeconds = Math.round(durationMinutes * 60);

    const timer: Timer = {
      id,
      taskId,
      label,
      durationSeconds,
      remainingSeconds: durationSeconds,
      status: "running",
      createdAt: Date.now(),
    };

    this.timers.set(id, timer);
    this.startInterval(id);
    this.notifyListeners();

    return id;
  }

  /**
   * Pause a running timer
   */
  pauseTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer || timer.status !== "running") return;

    // Stop the interval
    this.stopInterval(timerId);

    // Update timer state
    timer.status = "paused";
    timer.pausedAt = Date.now();

    this.notifyListeners();
  }

  /**
   * Resume a paused timer
   */
  resumeTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer || timer.status !== "paused") return;

    timer.status = "running";
    timer.pausedAt = undefined;

    this.startInterval(timerId);
    this.notifyListeners();
  }

  /**
   * Reset a timer to original duration
   */
  resetTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    this.stopInterval(timerId);

    timer.remainingSeconds = timer.durationSeconds;
    timer.status = "running";
    timer.pausedAt = undefined;

    this.startInterval(timerId);
    this.notifyListeners();
  }

  /**
   * Dismiss (delete) a timer
   */
  dismissTimer(timerId: string): void {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    this.stopInterval(timerId);
    timer.status = "dismissed";

    // Remove after brief delay (for animation)
    setTimeout(() => {
      this.timers.delete(timerId);
      this.notifyListeners();
    }, 200);

    this.notifyListeners();
  }

  /**
   * Get all active (non-dismissed) timers
   */
  getActiveTimers(): Timer[] {
    return Array.from(this.timers.values())
      .filter((t) => t.status !== "dismissed")
      .sort((a, b) => a.remainingSeconds - b.remainingSeconds);
  }

  /**
   * Get timer by ID
   */
  getTimer(timerId: string): Timer | undefined {
    return this.timers.get(timerId);
  }

  /**
   * Add time to a timer
   */
  addTime(timerId: string, secondsToAdd: number): void {
    const timer = this.timers.get(timerId);
    if (!timer || timer.status === "dismissed") return;

    timer.remainingSeconds = Math.max(0, timer.remainingSeconds + secondsToAdd);
    timer.durationSeconds = timer.durationSeconds + secondsToAdd;

    // If timer was completed but we added time, restart it
    if (timer.status === "completed" && timer.remainingSeconds > 0) {
      timer.status = "running";
      this.startInterval(timerId);
    }

    this.notifyListeners();
  }

  /**
   * Initialize audio context (must be called from user interaction)
   */
  initAudio(): void {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    } catch (err) {
      console.warn("Web Audio API not available:", err);
    }
  }

  /**
   * Play timer completion sound
   */
  private playAlertSound(): void {
    if (!this.audioContext) {
      this.initAudio();
    }

    if (!this.audioContext) return;

    try {
      // Create oscillator for beep pattern
      const playBeep = (
        frequency: number,
        startTime: number,
        duration: number
      ) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = this.audioContext.currentTime;

      // Three-beep pattern (common kitchen timer sound)
      playBeep(880, now, 0.15); // A5
      playBeep(880, now + 0.2, 0.15);
      playBeep(1047, now + 0.4, 0.3); // C6 (higher, longer)
    } catch (err) {
      console.warn("Failed to play audio:", err);
    }
  }

  /**
   * Try to vibrate (mobile devices)
   */
  private vibrate(): void {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch {
        // Vibration not available
      }
    }
  }

  /**
   * Start interval for a timer
   */
  private startInterval(timerId: string): void {
    // Clear any existing interval
    this.stopInterval(timerId);

    const intervalId = window.setInterval(() => {
      const timer = this.timers.get(timerId);
      if (!timer || timer.status !== "running") {
        this.stopInterval(timerId);
        return;
      }

      timer.remainingSeconds--;

      if (timer.remainingSeconds <= 0) {
        timer.remainingSeconds = 0;
        timer.status = "completed";
        this.stopInterval(timerId);

        // Alert user
        this.playAlertSound();
        this.vibrate();
      }

      this.notifyListeners();
    }, 1000);

    this.intervals.set(timerId, intervalId);
  }

  /**
   * Stop interval for a timer
   */
  private stopInterval(timerId: string): void {
    const intervalId = this.intervals.get(timerId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(timerId);
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const timers = this.getActiveTimers();
    const listenerArray = Array.from(this.listeners);
    for (const listener of listenerArray) {
      listener(timers);
    }
  }

  /**
   * Clean up all timers
   */
  cleanup(): void {
    const intervalIds = Array.from(this.intervals.keys());
    for (const timerId of intervalIds) {
      this.stopInterval(timerId);
    }
    this.timers.clear();
    this.listeners.clear();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let timerServiceInstance: TimerServiceImpl | null = null;

/**
 * Get the timer service instance
 */
export function getTimerService(): TimerServiceImpl {
  if (!timerServiceInstance) {
    timerServiceInstance = new TimerServiceImpl();
  }
  return timerServiceInstance;
}

/**
 * Format seconds as MM:SS
 */
export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format seconds as human-readable duration
 */
export function formatTimerDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
}
