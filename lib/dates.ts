// 날짜를 다루는 작은 도우미 함수들

// 같은 날인지 비교할 때 쓰는 "2026-11-05" 형태의 글자 (내 컴퓨터 시간 기준)
export function toDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// date에서 n일 뒤(음수면 n일 전) 날짜
export function addDays(date: Date, n: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

// 그림일기 날짜 줄에 넣을 조각들: 2026 / 11 / 5 / 목
export function dateParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: date.toLocaleDateString("ko-KR", { weekday: "short" }),
  };
}

// "11월 4일 수요일" (올해가 아니면 "2025년 11월 4일 화요일")
export function formatDayHeading(date: Date, now: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// "오후 3:20"
export function formatTime(date: Date) {
  return date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}
