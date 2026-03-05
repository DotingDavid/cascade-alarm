export interface Alarm {
  id: string;
  notificationId?: string;
  time: Date;
  label: string;
  status: 'pending' | 'fired' | 'dismissed';
}

export interface TimeValue {
  hours: number;
  minutes: number;
}
