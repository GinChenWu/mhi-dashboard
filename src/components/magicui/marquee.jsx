/* 來源：Magic UI 的 Marquee，轉成 JS。 */
import { cn } from "@/lib/utils";

export function Marquee({ className, reverse = false, pauseOnHover = false, children, vertical = false, repeat = 4, ...props }) {
  return (
    <div {...props} className={cn("group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]", { "flex-row": !vertical, "flex-col": vertical }, className)}>
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 || undefined}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
