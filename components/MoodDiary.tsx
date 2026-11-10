"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MOODS, findMood, type MoodId } from "@/lib/moods";
import { loadEntries, saveEntries, type Entry } from "@/lib/storage";
import { addDays, dateParts, formatDayHeading, formatTime, toDayKey } from "@/lib/dates";
import ManuscriptInput, { splitChars } from "./ManuscriptInput";
import MoodCalendar from "./MoodCalendar";

// 원고지 한 줄 = 20칸. 메모를 더 길게 쓰고 싶으면 이 숫자를 바꾸세요.
const MEMO_CELLS = 20;

export default function MoodDiary() {
  // 이 컴포넌트는 브라우저에서만 그려지기 때문에(page.tsx 참고)
  // 처음부터 바로 localStorage를 읽을 수 있어요.
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [today, setToday] = useState(() => new Date());

  // 지금 쓰고 있는 오늘 일기
  const [mood, setMood] = useState<MoodId | null>(null);
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState("");
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  // 앱을 켜 둔 채 자정이 지나면 날짜 줄과 달력의 "오늘"을 새 날짜로 바꿔요.
  useEffect(() => {
    function refreshIfNewDay() {
      const now = new Date();
      if (toDayKey(now) !== toDayKey(today)) setToday(now);
    }

    // ① 다음 자정(+1초)에 맞춰 한 번 확인
    const nextMidnight = new Date(today);
    nextMidnight.setHours(24, 0, 0, 0);
    const timer = setTimeout(refreshIfNewDay, nextMidnight.getTime() - Date.now() + 1000);

    // ② 노트북을 덮었다 열거나 다른 탭에서 돌아오면 타이머가 늦을 수 있어서, 그때도 확인
    document.addEventListener("visibilitychange", refreshIfNewDay);
    window.addEventListener("focus", refreshIfNewDay);

    // 정리: today가 바뀌어 다시 실행되기 전에 예전 타이머와 감시를 꺼요.
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshIfNewDay);
      window.removeEventListener("focus", refreshIfNewDay);
    };
  }, [today]);

  function updateEntries(next: Entry[]) {
    setEntries(next); // 화면 갱신
    saveEntries(next); // 브라우저에 저장
  }

  function handleSave(event: FormEvent) {
    event.preventDefault(); // 폼 제출 시 페이지가 새로고침되지 않게 막기
    if (!mood) return;

    const now = new Date();
    const entry: Entry = {
      id: now.getTime().toString(36) + Math.random().toString(36).slice(2, 7),
      mood,
      memo: memo.trim(),
      createdAt: now.toISOString(),
    };

    updateEntries([entry, ...entries]);
    setToday(now);
    setLastSavedId(entry.id);
    setMood(null);
    setMemo("");
    setStatus("저장했어요. 아래 일기장에 쌓였어요.");
  }

  function handleDelete(entry: Entry) {
    if (!window.confirm("이 기록을 지울까요? 지우면 되돌릴 수 없어요.")) return;
    updateEntries(entries.filter((e) => e.id !== entry.id));
  }

  // 달력에서 날짜를 누르면: 아래 그날 기록으로 스크롤하고 형광펜으로 잠깐 칠해요.
  function showDay(dayKey: string) {
    const target = document.getElementById(`day-${dayKey}`);
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true }); // 키보드 사용자도 그 자리에서 이어서 읽을 수 있게
    const highlight = getComputedStyle(target).getPropertyValue("--highlight");
    target.animate([{ backgroundColor: highlight }, { backgroundColor: "transparent" }], {
      duration: 1800,
      easing: "ease-out",
    });
  }

  const { year, month, day, weekday } = dateParts(today);
  const groups = groupByDay(entries);
  const memoLength = splitChars(memo).length;

  return (
    <>
      <section className="sheet" aria-labelledby="today-heading">
        <form onSubmit={handleSave}>
          <h2 id="today-heading" className="dateline">
            {/* date-part로 묶어서 "요 / 일"처럼 중간에서 줄이 바뀌지 않게 해요 */}
            <span className="date-part">
              <span className="fill">{year}</span>년
            </span>{" "}
            <span className="date-part">
              <span className="fill">{month}</span>월
            </span>{" "}
            <span className="date-part">
              <span className="fill">{day}</span>일
            </span>{" "}
            <span className="date-part">
              <span className="fill">{weekday}</span>요일
            </span>
          </h2>

          <fieldset className="field">
            <legend className="field-label">오늘 기분</legend>
            <div className="moods">
              {MOODS.map((option) => (
                <label key={option.id} className="mood">
                  <input
                    type="radio"
                    name="mood"
                    value={option.id}
                    checked={mood === option.id}
                    onChange={() => {
                      setMood(option.id);
                      setStatus("");
                    }}
                  />
                  <span className="mood-face" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span className="mood-label">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <div className="field-row">
              <label htmlFor="memo" className="field-label">
                한 줄 메모
              </label>
              <span id="memo-count" className="memo-count">
                {memoLength}/{MEMO_CELLS}칸
              </span>
            </div>
            <ManuscriptInput
              id="memo"
              value={memo}
              onChange={setMemo}
              cells={MEMO_CELLS}
              describedBy="memo-count"
            />
          </div>

          <div className="actions">
            <p className="status" aria-live="polite">
              {status || (!mood && "기분을 고르면 저장할 수 있어요.")}
            </p>
            <button type="submit" className="save-button" disabled={!mood}>
              저장하기
            </button>
          </div>
        </form>
      </section>

      <MoodCalendar entries={entries} today={today} onSelectDay={showDay} />

      <section className="sheet" aria-labelledby="log-heading">
        <h2 id="log-heading" className="sheet-title">
          지금까지 쓴 일기
        </h2>

        {groups.length === 0 ? (
          <p className="empty">
            아직 쓴 일기가 없어요. 위에서 오늘 기분을 골라 첫 줄을 채워 보세요.
          </p>
        ) : (
          <ol className="days">
            {groups.map((group) => (
              <li key={group.dayKey} id={`day-${group.dayKey}`} className="day" tabIndex={-1}>
                <h3 className="day-heading">
                  {formatDayHeading(group.date, today)}
                  {relativeDay(group.dayKey, today) && (
                    <span className="day-tag">{relativeDay(group.dayKey, today)}</span>
                  )}
                </h3>
                <ul className="entries">
                  {group.items.map((entry) => {
                    const entryMood = findMood(entry.mood);
                    const time = formatTime(new Date(entry.createdAt));
                    return (
                      <li key={entry.id} className="entry">
                        <span
                          className={entry.id === lastSavedId ? "stamp is-new" : "stamp"}
                          style={{ rotate: `${tiltFor(entry.id)}deg` }}
                          role="img"
                          aria-label={`기분: ${entryMood.label}`}
                        >
                          {entryMood.emoji}
                        </span>
                        <p className={entry.memo ? "entry-memo" : "entry-memo is-blank"}>
                          {entry.memo || "메모 없음"}
                        </p>
                        <time className="entry-time" dateTime={entry.createdAt}>
                          {time}
                        </time>
                        <button
                          type="button"
                          className="entry-delete"
                          onClick={() => handleDelete(entry)}
                          aria-label={`${time} 기록 지우기`}
                        >
                          지우기
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

// 일기들을 최신순으로 정렬한 뒤, 같은 날짜끼리 묶습니다.
function groupByDay(entries: Entry[]) {
  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const groups: { dayKey: string; date: Date; items: Entry[] }[] = [];

  for (const entry of sorted) {
    const date = new Date(entry.createdAt);
    const dayKey = toDayKey(date);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dayKey === dayKey) {
      lastGroup.items.push(entry);
    } else {
      groups.push({ dayKey, date, items: [entry] });
    }
  }
  return groups;
}

// 오늘·어제면 꼬리표를 붙여 줍니다.
function relativeDay(dayKey: string, today: Date) {
  if (dayKey === toDayKey(today)) return "오늘";
  if (dayKey === toDayKey(addDays(today, -1))) return "어제";
  return null;
}

// 도장이 매번 조금씩 다른 각도로 찍힌 것처럼 보이게 (-9° ~ +9°)
function tiltFor(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return (sum % 19) - 9;
}
