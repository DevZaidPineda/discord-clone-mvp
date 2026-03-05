"use client";

import { useEffect, useRef } from "react";

export function useChatScroll<T>(dep: T) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const { scrollHeight, clientHeight, scrollTop } = ref.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isNearBottom) {
        ref.current.scrollTop = scrollHeight;
      }
    }
  }, [dep]);

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  return { ref, scrollToBottom };
}
