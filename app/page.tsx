"use client";

import dynamic from "next/dynamic";

// 일기 부분은 브라우저 저장소(localStorage)를 쓰기 때문에
// 서버에서 미리 그리지 않고(ssr: false) 브라우저에서만 그립니다.
const MoodDiary = dynamic(() => import("@/components/MoodDiary"), {
  ssr: false,
  loading: () => <div className="sheet is-loading" aria-busy="true" />,
});

export default function Home() {
  return (
    <main className="desk">
      <h1 className="app-title">오늘의 기분 일기</h1>
      <MoodDiary />
      <p className="desk-note">
        기록은 이 브라우저에만 저장돼요. 다른 기기나 다른 브라우저에서는 보이지 않아요.
      </p>
    </main>
  );
}
