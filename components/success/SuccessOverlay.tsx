"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogoFormation } from "./LogoFormation";

type Props = {
  open: boolean;
  onClose?: () => void;
};

export function SuccessOverlay({ open, onClose }: Props) {
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimDone(false);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && !animDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-md"
        >
          <LogoFormation
            onComplete={() => {
              setAnimDone(true);
              setTimeout(() => onClose?.(), 300);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
