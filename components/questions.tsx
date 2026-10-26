"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface Question {
  question: string;
  answer: string;
}

/**
 * One answer open at a time. The list keeps room for its longest answer, so opening any question grows into space
 * that is already there and nothing below it moves.
 */
export function Questions({ questions }: { questions: Question[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number>();
  const id = useId();

  useEffect(() => {
    const element = list.current;
    if (!element) return;
    // The list closed, plus its longest answer: tall enough for any one question to be open.
    const measure = () => {
      // Fractional heights throughout, so rounding never leaves the list a pixel or two short.
      const rows = [...element.querySelectorAll<HTMLElement>(".question")];
      const border = (row: HTMLElement) => parseFloat(getComputedStyle(row).borderBottomWidth);
      const height = (row: HTMLElement, part: string) => row.querySelector(part)!.getBoundingClientRect().height;
      const closed = rows.reduce((total, row) => total + height(row, ".question-toggle") + border(row), 0);
      const answers = rows.map((row) => height(row, ".answer p"));
      setMinHeight(Math.ceil(closed + Math.max(0, ...answers)));
    };
    const resizes = new ResizeObserver(measure);
    resizes.observe(element);
    measure();
    return () => resizes.disconnect();
  }, []);

  return (
    <div className="question-list" ref={list} style={{ minHeight }}>
      {questions.map(({ question, answer }, index) => {
        const isOpen = open === index;
        return (
          <div className="question" key={question} data-open={isOpen || undefined}>
            <button
              type="button"
              className="question-toggle"
              aria-expanded={isOpen}
              aria-controls={`${id}-${index}`}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span>{question}</span>
              <span className="question-icon" aria-hidden="true" />
            </button>
            <div className="answer" id={`${id}-${index}`} role="region" aria-hidden={!isOpen}>
              <div className="answer-inner">
                <p>{answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
