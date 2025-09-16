interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private lastPromptTime: number = 0;
  private dismissedUntil: number = 0;
  private promptCooldown: number = 2 * 60 * 60 * 1000; // 2 hours
  
  constructor() {
    this.permission = Notification.permission;
    this.loadDismissalState();
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }
  }

  private loadDismissalState() {
    try {
      const dismissed = localStorage.getItem('gutwise_notifications_dismissed_until');
      if (dismissed) {
        this.dismissedUntil = parseInt(dismissed, 10);
      }
      
      const lastPrompt = localStorage.getItem('gutwise_last_prompt_time');
      if (lastPrompt) {
        this.lastPromptTime = parseInt(lastPrompt, 10);
      }
    } catch (error) {
      console.warn('Failed to load notification dismissal state:', error);
    }
  }

  private saveDismissalState() {
    try {
      localStorage.setItem('gutwise_notifications_dismissed_until', this.dismissedUntil.toString());
      localStorage.setItem('gutwise_last_prompt_time', this.lastPromptTime.toString());
    } catch (error) {
      console.warn('Failed to save notification dismissal state:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge,
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        actions: options.actions || []
      });

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  canShowEatingOutPrompt(): boolean {
    const now = Date.now();
    
    // Check if notifications are dismissed
    if (now < this.dismissedUntil) {
      return false;
    }
    
    // Check cooldown period
    if (now - this.lastPromptTime < this.promptCooldown) {
      return false;
    }
    
    return true;
  }

  async showEatingOutPrompt(onChooseRestaurant: () => void): Promise<void> {
    if (!this.canShowEatingOutPrompt()) {
      return;
    }

    // Request permission if needed
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    this.lastPromptTime = Date.now();
    this.saveDismissalState();

    const notification = await this.showNotification({
      title: 'GutWise Check-in',
      body: 'Are you eating out? We found restaurants nearby with safe options for you.',
      icon: '/favicon.ico',
      tag: 'eating-out-prompt',
      requireInteraction: true,
      actions: [
        {
          action: 'choose-restaurant',
          title: 'Choose Restaurant'
        },
        {
          action: 'dismiss',
          title: 'Not eating out'
        }
      ]
    });

    if (notification) {
      notification.onclick = () => {
        onChooseRestaurant();
        notification.close();
      };

      // Handle action buttons (if supported)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'notification-action') {
            if (event.data.action === 'choose-restaurant') {
              onChooseRestaurant();
            } else if (event.data.action === 'dismiss') {
              this.dismissEatingOutPrompts(2 * 60 * 60 * 1000); // Dismiss for 2 hours
            }
          }
        });
      }

      // Auto-close after 10 seconds if no interaction
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);
    }
  }

  dismissEatingOutPrompts(duration: number = 4 * 60 * 60 * 1000): void {
    // Default: dismiss for 4 hours
    this.dismissedUntil = Date.now() + duration;
    this.saveDismissalState();
  }

  reset(): void {
    this.dismissedUntil = 0;
    this.lastPromptTime = 0;
    this.saveDismissalState();
  }
}

export const notificationService = new NotificationService();