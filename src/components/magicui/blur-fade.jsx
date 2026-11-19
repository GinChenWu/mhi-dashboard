/* 來源：Magic UI 的 BlurFade，轉成 JS。使用者偏好減少動態時，直接顯示內容。 */
import { useRef } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

export function BlurFade({ children, className, variant, duration = 0.4, delay = 0, offset = 6, direction = "down", inView = false, inViewMargin = "-50px", blur = "6px", ...props }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const defaultVariants = {
    hidden: { [axis]: direction === "right" || direction === "down" ? -offset : offset, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant ?? defaultVariants;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <AnimatePresence>
      <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className} {...props}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
