import type { CoursesType } from "@/types";
import { getLocalDateString } from "@/lib/date";

export const checkAttendanceAccess = (
  course: CoursesType | undefined,
  selectedDate: string,
  role: string,
) => {
  if (!course || !role) return { canEdit: false, reason: "Loading data..." };

  if (role === "admin" || role === "manager") return { canEdit: true };

  const now = new Date();
  const todayStr = getLocalDateString(now);

  // Teachers can only mark attendance for the current date
  if (selectedDate !== todayStr) {
    return {
      canEdit: false,
      reason: "You can only mark attendance for the current date.",
    };
  }

  // Check if it's the correct day of the week for the course
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = days[now.getDay()];

  if (course.day !== currentDay) {
    return {
      canEdit: false,
      reason: `Today is not a scheduled day for ${course.name}.`,
    };
  }

  // Remove time window restrictions to allow teachers to manage attendance at any time during the scheduled day.
  return { canEdit: true };
};
