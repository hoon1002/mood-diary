"use client";

import { useRef, useState } from "react";

// 글자를 "사람 눈에 보이는 한 글자" 단위로 나눕니다.
// (👍🏻 같은 이모지는 내부적으로 2글자라서, 그냥 자르면 칸 두 개로 쪼개져요)
const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter("ko", { granularity: "grapheme" })
    : null;

export function splitChars(text: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(text), (s) => s.segment);
  return Array.from(text);
}

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  cells: number; // 원고지 칸 수 = 최대 글자 수
  describedBy?: string;
};

// 원고지 모양 입력칸.
// 진짜 <input>은 투명하게 위에 덮어 두고(키보드·한글 조합·화면 읽기 담당),
// 눈에 보이는 건 아래에 한 칸씩 따로 그린 글자들입니다.
export default function ManuscriptInput({ id, value, onChange, cells, describedBy }: Props) {
  const cellsRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  // 커서(또는 드래그로 고른 범위)가 몇 번째 칸에 있는지
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const chars = splitChars(value);

  // 진짜 입력창의 커서 위치를 "몇 번째 칸"으로 바꿔서 기억
  function syncSelection(input: HTMLInputElement) {
    const start = splitChars(input.value.slice(0, input.selectionStart ?? 0)).length;
    const end = splitChars(input.value.slice(0, input.selectionEnd ?? 0)).length;
    setSelection({ start, end });
  }

  // 칸을 누르면 커서를 그 칸으로 옮기기
  function handleClick(event: React.MouseEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const cellEls = Array.from(cellsRef.current?.children ?? []);
    const index = cellEls.findIndex((el) => {
      const r = el.getBoundingClientRect();
      return (
        event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top && event.clientY <= r.bottom
      );
    });
    if (index === -1) return;
    const position = Math.min(index, chars.length);
    const offset = chars.slice(0, position).join("").length;
    input.setSelectionRange(offset, offset);
    syncSelection(input);
  }

  const showCaret = focused && selection.start === selection.end;

  return (
    <div className="manuscript">
      <div className="manuscript-cells" ref={cellsRef} aria-hidden="true">
        {Array.from({ length: cells }, (_, i) => {
          const isSelected = i >= selection.start && i < selection.end;
          const caretHere = showCaret && (i === selection.start || (i === cells - 1 && selection.start === cells));
          return (
            <span key={i} className={isSelected ? "cell is-selected" : "cell"}>
              {chars[i] ?? ""}
              {caretHere && (
                <span className={selection.start === cells ? "caret is-end" : "caret"} />
              )}
            </span>
          );
        })}
      </div>
      <input
        id={id}
        className="manuscript-input"
        type="text"
        value={value}
        maxLength={cells}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={describedBy}
        onChange={(e) => {
          onChange(e.target.value);
          syncSelection(e.target);
        }}
        onSelect={(e) => syncSelection(e.currentTarget)}
        onClick={handleClick}
        onFocus={(e) => {
          setFocused(true);
          syncSelection(e.currentTarget);
        }}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
