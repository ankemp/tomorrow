// Mirrors the browser Notification class
export interface IPushNotificationEvent {
  title: string;
  dir?: NotificationDirection;
  lang?: string;
  body?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: unknown;
  vibrate?: number | number[];
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
}

export class PushNotificationEvent implements IPushNotificationEvent {
  title: string;
  dir?: NotificationDirection;
  lang?: string;
  body?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: unknown;
  vibrate?: number | number[];
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    if (options) {
      this.dir = options.dir;
      this.lang = options.lang;
      this.body = options.body;
      this.tag = options.tag;
      this.icon = options.icon;
      this.badge = options.badge;
      this.image = options.image;
      this.data = options.data;
      this.vibrate = options.vibrate;
      this.renotify = options.renotify;
      this.requireInteraction = options.requireInteraction;
      this.silent = options.silent;
      this.timestamp = options.timestamp;
      this.actions = options.actions;
    }
  }

  toBuffer(): Buffer {
    const json = JSON.stringify({
      title: this.title,
      dir: this.dir,
      lang: this.lang,
      body: this.body,
      tag: this.tag,
      icon: this.icon,
      badge: this.badge,
      image: this.image,
      data: this.data,
      vibrate: this.vibrate,
      renotify: this.renotify,
      requireInteraction: this.requireInteraction,
      silent: this.silent,
      timestamp: this.timestamp,
      actions: this.actions,
    });
    return Buffer.from(json, 'utf-8');
  }
}

// Types from the browser Notification API
export type NotificationDirection = 'auto' | 'ltr' | 'rtl';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  dir?: NotificationDirection;
  lang?: string;
  body?: string;
  tag?: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: unknown;
  vibrate?: number | number[];
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
}
