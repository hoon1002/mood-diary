"use client";

import { findMood } from "@/lib/moods";
import type { Entry } from "@/lib/storage";
import { addDays, formatDayHeading, toDayKey } from "@/lib/dates";

// 며칠을 보여 줄지. 60으로 바꾸면 두 달치가 보여요.
const DAYS = 30;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  entries: Entry[];
  today: Date;
  onSelectDay: (dayKey: string) => void; // 기록이 있는 날짜 칸을 누르면 불러요
};

type CalendarDay = {
  dayKey: string;
  date: Date;
  latest: Entry | null; // 그날 마지막에 쓴 기록 (없으면 null)
  count: number; // 그날 기록 개수
};

// 오늘을 포함한 최근 DAYS일을 하루씩 만들고, 날짜마다 기록을 짝지어요.
function buildDays(entries: Entry[], today: Date): CalendarDay[] {
  // 1) 기록을 한 번 훑어서 날짜별 "마지막 기록"과 "개수"를 모아 둡니다.
  const byDay = new Map<string, { latest: Entry; count: number }>();
  for (const entry of entries) {
    const dayKey = toDayKey(new Date(entry.createdAt));
    const found = byDay.get(dayKey);
    if (!found) {
      byDay.set(dayKey, { latest: entry, count: 1 });
    } else {
      found.count += 1;
      if (entry.createdAt > found.latest.createdAt) found.latest = entry;
    }
  }

  // 2) (DAYS - 1)일 전부터 오늘까지 DAYS칸을 만듭니다.
  const firstDay = addDays(today, -(DAYS - 1));
  return Array.from({ length: DAYS }, (_, i) => {
    const date = addDays(firstDay, i);
    const dayKey = toDayKey(date);
    const info = byDay.get(dayKey);
    return { dayKey, date, latest: info?.latest ?? null, count: info?.count ?? 0 };
  });
}

export default function MoodCalendar({ entries, today, onSelectDay }: Props) {
  const days = buildDays(entries, today);
  const todayKey = toDayKey(today);
  const recordedDays = days.filter((day) => day.count > 0).length;
  // 첫날이 수요일(3)이면 일·월·화 자리 3칸을 비워 둬야 요일이 맞아요.
  const leadingBlanks = days[0].date.getDay();

  return (
    <section className="sheet" aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" className="sheet-title">
        최근 {DAYS}일 기분
      </h2>
      <p className="calendar-summary">
        {recordedDays === 0
          ? `최근 ${DAYS}일 동안 쓴 일기가 아직 없어요.`
          : `${DAYS}일 중 ${recordedDays}일 기록했어요.`}
      </p>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <ol className="calendar-grid">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <li key={`blank-${i}`} aria-hidden="true" />
        ))}

        {days.map((day, i) => {
          const mood = day.latest ? findMood(day.latest.mood) : null;
          const isToday = day.dayKey === todayKey;
          // 달력 첫 칸과 매달 1일에는 "11/1"처럼 월도 함께 적어요.
          const showMonth = i === 0 || day.date.getDate() === 1;
          const dateLabel = showMonth
            ? `${day.date.getMonth() + 1}/${day.date.getDate()}`
            : String(day.date.getDate());

          // 화면 읽기 프로그램이 읽어 줄 문장: "11월 5일 목요일, 오늘, 좋아, 기록 2개"
          const description = [
            formatDayHeading(day.date, today),
            isToday && "오늘",
            mood ? mood.label : "기록 없음",
            day.count > 1 && `기록 ${day.count}개`,
          ]
            .filter(Boolean)
            .join(", ");

          const cellContent = (
            <>
              <span className="sr-only">{description}</span>
              <span className="calendar-date" aria-hidden="true">
                {dateLabel}
              </span>
              {mood ? (
                <span className="calendar-stamp" aria-hidden="true">
                  {mood.emoji}
                  {day.count > 1 && <span className="calendar-count">{day.count}</span>}
                </span>
              ) : (
                <span className="calendar-dot" aria-hidden="true" />
              )}
            </>
          );

          return (
            <li key={day.dayKey} className={isToday ? "calendar-day is-today" : "calendar-day"}>
              {mood ? (
                <button
                  type="button"
                  className="calendar-cell"
                  onClick={() => onSelectDay(day.dayKey)}
                >
                  {cellContent}
                </button>
              ) : (
                <div className="calendar-cell">{cellContent}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
