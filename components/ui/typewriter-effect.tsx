"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(
        "span.char",
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.15, delay: (i: number) => i * 0.04 }
      );
    }
  }, [isInView, animate]);

  return (
    <div className={cn("my-6", className)}>
      <span ref={scope}>
        {wordsArray.map((word, wIdx) => (
          <span key={`word-${wIdx}`} className="inline-block">
            {word.text.map((char, cIdx) => (
              <span
                key={`char-${wIdx}-${cIdx}`}
                className={cn(
                  "char inline-block opacity-0",
                  word.className
                )}
              >
                {char}
              </span>
            ))}
            &nbsp;
          </span>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className={cn(
            "inline-block rounded-sm w-[4px] h-6 md:h-10 bg-primary ml-0.5 align-middle",
            cursorClassName
          )}
        />
      </span>
    </div>
  );
};
