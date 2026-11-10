// 고를 수 있는 기분 5가지.
// 이모지나 이름을 바꾸고 싶으면 여기만 고치면 됩니다.
export const MOODS = [
  { id: "excited", emoji: "😆", label: "신나" },
  { id: "good", emoji: "😊", label: "좋아" },
  { id: "meh", emoji: "😐", label: "그럭저럭" },
  { id: "sad", emoji: "😢", label: "슬퍼" },
  { id: "angry", emoji: "😠", label: "화나" },
] as const;

// "excited" | "good" | ... 처럼 위 id 중 하나만 들어갈 수 있는 타입
export type MoodId = (typeof MOODS)[number]["id"];

export function findMood(id: MoodId) {
  return MOODS.find((mood) => mood.id === id) ?? MOODS[2];
}
