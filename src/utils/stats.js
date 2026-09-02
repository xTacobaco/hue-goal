import dayjs from "@/utils/dayjs";

export function uniqueDayUnix(timestamps) {
  const days = new Set();
  for (const stamp of timestamps || []) {
    days.add(dayjs.unix(stamp).startOf("date").unix());
  }
  return [...days].sort((a, b) => a - b);
}

export function currentStreak(dayUnixList, todayUnix) {
  const days = new Set(dayUnixList);
  if (days.size === 0) {
    return 0;
  }

  let cursor = dayjs.unix(todayUnix).startOf("date");
  if (!days.has(cursor.unix())) {
    cursor = cursor.subtract(1, "day");
    if (!days.has(cursor.unix())) {
      return 0;
    }
  }

  let count = 0;
  while (days.has(cursor.unix())) {
    count += 1;
    cursor = cursor.subtract(1, "day");
  }
  return count;
}

export function bestStreak(dayUnixList) {
  const sorted = [...dayUnixList].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = dayjs.unix(sorted[i]).diff(dayjs.unix(sorted[i - 1]), "day");
    if (gap === 1) {
      run += 1;
      if (run > best) {
        best = run;
      }
    } else if (gap > 1) {
      run = 1;
    }
  }
  return best;
}

export function dreamWeekCount(dayUnixList) {
  const byWeek = new Map();
  for (const unix of dayUnixList) {
    const week = dayjs.unix(unix).startOf("isoWeek").unix();
    byWeek.set(week, (byWeek.get(week) || 0) + 1);
  }

  let count = 0;
  for (const days of byWeek.values()) {
    if (days >= 7) {
      count += 1;
    }
  }
  return count;
}

export function tapCount(tracks) {
  let count = 0;
  for (const stamps of Object.values(tracks || {})) {
    count += (stamps || []).length;
  }
  return count;
}
