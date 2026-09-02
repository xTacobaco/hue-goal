import dayjs from "@/utils/dayjs";

export function weekdaysInView(day) {
  if (day.startOf("isoWeek").isSame(dayjs().startOf("isoWeek"))) {
    return Math.max(1, dayjs().isoWeekday());
  }
  return 7;
}

export function dayFillCss(day, weekdays = weekdaysInView(day)) {
  const hue = (day.isoWeek() / dayjs().isoWeeksInYear()) * 359;
  const light = 50 - ((day.isoWeekday() - 1) / Math.max(1, weekdays)) * 30;
  return `hsl(${hue}, 70%, ${light}%)`;
}
