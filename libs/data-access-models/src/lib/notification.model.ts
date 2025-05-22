export interface PushNotificationEvent extends Notification {
  readonly data: PushMessageData | null;
}

export interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}
