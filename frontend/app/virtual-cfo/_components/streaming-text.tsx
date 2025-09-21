"use client";

import { useState, useEffect } from "react";

interface StreamingTextProps {
  text: string;
  onComplete?: () => void;
  typingSpeed?: number;
}

export function StreamingText({ text, onComplete, typingSpeed = 10 }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (text.length === 0) return;

    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        // Typing complete
        setIsTyping(false);
        setTimeout(() => {
          setShowCursor(false);
          onComplete?.();
        }, 500);
      }
    };

    typeText();

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(cursorInterval);
    };
  }, [text, onComplete, typingSpeed]);

  return (
    <span>
      {displayedText}
      {(isTyping || showCursor) && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}