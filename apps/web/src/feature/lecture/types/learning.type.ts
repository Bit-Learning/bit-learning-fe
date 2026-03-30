export interface SyncProgressRequest {
  lectureId: number;
  currentSecond: number;
  totalDuration: number;
}

export interface LessonProgressResponse {
  lectureId: number;
  isCompleted: boolean;
  lastWatchedSecond: number;
}

export interface VideoQuality {
  label: string;
  value: string;
  height: number;
}

export interface PlaybackSpeed {
  label: string;
  value: number;
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [
  { label: "0.25x", value: 0.25 },
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2x", value: 2 },
];

export const VIDEO_QUALITIES: VideoQuality[] = [
  { label: "Auto", value: "auto", height: -1 },
  { label: "1080p", value: "1080", height: 1080 },
  { label: "720p", value: "720", height: 720 },
  { label: "480p", value: "480", height: 480 },
  { label: "360p", value: "360", height: 360 },
];

export interface UserLearningStatistics {
  totalEnrolledCourses: number;
  totalCompletedLectures: number;
  totalDurations: number;
  totalCertificates: number;
}
