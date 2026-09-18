import type { SVGProps } from "react";

export type IconName =
  | "palette" | "video" | "code" | "mobile" | "chart" | "spark" | "bot" | "pen"
  | "book" | "check" | "user" | "briefcase" | "bell" | "lock" | "unlock" | "certificate"
  | "paperclip" | "alert" | "heart" | "bolt" | "trophy" | "users" | "calendar" | "youtube"
  | "tiktok" | "instagram" | "facebook" | "x" | "linkedin" | "message" | "share" | "volume" | "volumeX";

const paths: Record<IconName, string> = {
  palette: "M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.8a1.8 1.8 0 0 1 0-3.6H15a6 6 0 0 0 0-12.8A9 9 0 0 0 12 3Z M7.5 9.2h.01 M10.2 6.5h.01 M15.2 6.8h.01 M17.4 10h.01",
  video: "M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 17.5v-11Z M16 9l4-2v10l-4-2",
  code: "m8 9-3 3 3 3 M16 9l3 3-3 3 M14 5l-4 14",
  mobile: "M7 2.8h10A2.2 2.2 0 0 1 19.2 5v14A2.2 2.2 0 0 1 17 21.2H7A2.2 2.2 0 0 1 4.8 19V5A2.2 2.2 0 0 1 7 2.8Z M10 18h4",
  chart: "M4 19V5 M4 19h17 M8 15l3-4 3 2 5-7",
  spark: "M12 3l1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3Z M19 16l.5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z",
  bot: "M8 8h8a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4Z M12 8V4 M9 13h.01 M15 13h.01 M9 17h6",
  pen: "m4 20 4.2-1 9.7-9.7a2.8 2.8 0 0 0-4-4L4.9 15 4 20Z M13.5 6.5l4 4",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z M4 18.5A2.5 2.5 0 0 1 6.5 16H20",
  check: "m5 12 4 4L19 6",
  user: "M20 21a8 8 0 0 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  briefcase: "M4 7h16v12H4z M9 7V4h6v3 M4 12h16 M10 12v2h4v-2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4",
  lock: "M6 10h12v10H6z M8 10V7a4 4 0 0 1 8 0v3",
  unlock: "M6 10h12v10H6z M8 10V7a4 4 0 0 1 7.5-2",
  certificate: "M5 3h14v12H5z M8 19l4-2 4 2v-4H8v4Z M8 7h8 M8 10h5",
  paperclip: "m9 17 6.5-6.5a3.5 3.5 0 0 0-5-5L4 12a5 5 0 0 0 7 7l6-6",
  alert: "M12 4 3 20h18L12 4Z M12 10v4 M12 17h.01",
  heart: "M20 8.5C20 14 12 19 12 19S4 14 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z",
  bolt: "m13 2-9 12h7l-1 8 9-12h-7l1-8Z",
  trophy: "M8 21h8 M12 17v4 M6 4h12v4a6 6 0 0 1-12 0V4Z M6 6H3v1a4 4 0 0 0 3 4 M18 6h3v1a4 4 0 0 1-3 4",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  calendar: "M5 4h14v16H5z M8 2v4 M16 2v4 M5 9h14",
  youtube: "M4 7.2A2.2 2.2 0 0 1 6.2 5h11.6A2.2 2.2 0 0 1 20 7.2v9.6a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 16.8V7.2Z M10 9l5 3-5 3V9Z",
  tiktok: "M14 4v10.5a3.5 3.5 0 1 1-3-3.45 M14 4c.6 2.2 2 3.5 4.5 3.8",
  instagram: "M6.5 3h11A3.5 3.5 0 0 1 21 6.5v11a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 17.5v-11A3.5 3.5 0 0 1 6.5 3Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M17.5 6.5h.01",
  facebook: "M14 21v-8h3l.5-3H14V8.2c0-.9.3-1.5 1.7-1.5H17V4.1c-.6-.1-1.4-.1-2.2-.1-2.7 0-4.6 1.6-4.6 4.6V10H7v3h3v8",
  x: "M5 4l14 16 M19 4 5 20",
  linkedin: "M5 8v12 M5 4.5v.01 M10 20v-7a4 4 0 0 1 8 0v7 M10 11a4 4 0 0 1 8 0",
  message: "M4 5h16v11H8l-4 4V5Z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  volume: "M11 5L6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14",
  volumeX: "M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6 M17 9l6 6",
};

export default function Icon({ name, size = 20, strokeWidth = 1.7, className = "" }: { name: IconName; size?: number; strokeWidth?: number; className?: string } & SVGProps<SVGSVGElement>) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={paths[name]} /></svg>;
}