// Simple utility to track check-in modal dismissals
class CheckInDismissalTracker {
  private readonly STORAGE_KEY = 'gutwise_checkin_dismissed_until';
  private readonly LAST_SHOWN_KEY = 'gutwise_checkin_last_shown';
  private readonly DEFAULT_DISMISSAL_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private readonly MIN_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours minimum between prompts

  canShowCheckIn(): boolean {
    const now = Date.now();
    
    try {
      // Check if dismissed
      const dismissedUntil = localStorage.getItem(this.STORAGE_KEY);
      if (dismissedUntil && now < parseInt(dismissedUntil, 10)) {
        return false;
      }
      
      // Check minimum interval since last shown
      const lastShown = localStorage.getItem(this.LAST_SHOWN_KEY);
      if (lastShown && (now - parseInt(lastShown, 10)) < this.MIN_INTERVAL) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Error checking check-in dismissal state:', error);
      return true; // Default to showing if there's an error
    }
  }

  markAsShown(): void {
    try {
      localStorage.setItem(this.LAST_SHOWN_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Error marking check-in as shown:', error);
    }
  }

  dismissFor(duration: number = this.DEFAULT_DISMISSAL_DURATION): void {
    try {
      const dismissUntil = Date.now() + duration;
      localStorage.setItem(this.STORAGE_KEY, dismissUntil.toString());
    } catch (error) {
      console.warn('Error dismissing check-in:', error);
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.LAST_SHOWN_KEY);
    } catch (error) {
      console.warn('Error resetting check-in dismissal:', error);
    }
  }

  // Quick dismiss methods
  dismissForTwoHours(): void {
    this.dismissFor(2 * 60 * 60 * 1000);
  }

  dismissForFourHours(): void {
    this.dismissFor(4 * 60 * 60 * 1000);
  }

  dismissForDay(): void {
    this.dismissFor(24 * 60 * 60 * 1000);
  }
}

export const checkInDismissalTracker = new CheckInDismissalTracker();