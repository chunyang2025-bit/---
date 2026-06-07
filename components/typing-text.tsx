'use client';

import { useEffect, useMemo, useState } from 'react';

type TypingTextProps = {
  text: string;
  className?: string;
};

export default function TypingText({ text, className }: TypingTextProps) {
  const [count, setCount] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    setCount(0);
    const interval = window.setInterval(() => {
      setCount((current) => {
        if (current >= chars.length) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 18);

    return () => window.clearInterval(interval);
  }, [chars.length, text]);

  const complete = count >= chars.length;

  return (
    <p className={`${className ?? ''} ${complete ? '' : 'typing-caret'}`}>
      {chars.slice(0, count).join('')}
    </p>
  );
}
