import type { MoodId } from "./moods";

// 일기 한 개의 모양
export type Entry = {
  id: string;
  mood: MoodId;
  memo: string;
  createdAt: string; // 저장한 시각 (예: "2026-11-05T06:20:00.000Z")
};

// 브라우저 localStorage에 저장할 때 쓰는 이름표
const STORAGE_KEY = "mood-diary:entries";

// 저장된 일기 불러오기. 저장된 게 없거나 망가졌으면 빈 목록을 돌려줍니다.
export function loadEntries(): Entry[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 일기 목록 전체를 저장하기 (localStorage에는 글자만 저장되므로 JSON 글자로 바꿔서 넣습니다)
export function saveEntries(entries: Entry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
