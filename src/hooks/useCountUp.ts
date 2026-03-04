import { useEffect, useState, useRef } from "react";

/**
 * Premium count-up animation hook for financial data.
 * Creates that "Bloomberg Terminal" feel where numbers animate smoothly.
 *
 * @param target - The target number to animate to
 * @param duration - Animation duration in milliseconds (default: 1200ms)
 * @param decimals - Number of decimal places (default: 0)
 * @returns The animated number value as a string
 */
export function useCountUp(
  target: number,
  duration: number = 1200,
  decimals: number = 0,
): string {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // If target hasn't changed meaningfully, skip animation
    if (Math.abs(target - prevTarget.current) < 0.001) {
      setCount(target);
      return;
    }

    const startValue = prevTarget.current;
    const startTime = performance.now();
    const diff = target - startValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out for premium feel: 1 - (1 - x)^3
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(startValue + diff * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
        setCount(target); // Ensure we land exactly on target
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  // Format the output
  return decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString();
}

/**
 * Hook that detects value changes and returns a flash class.
 * Use this to flash numbers green when they go up, red when down.
 *
 * @param value - The current value to track
 * @param flashDuration - How long the flash class stays active (default: 600ms)
 * @returns { flashClass, previousValue }
 */
export function useValueFlash(
  value: number,
  flashDuration: number = 600,
): { flashClass: string; direction: "up" | "down" | null } {
  const [flashClass, setFlashClass] = useState("");
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const prevValue = useRef(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip if value hasn't changed meaningfully
    if (Math.abs(value - prevValue.current) < 0.001) {
      return;
    }

    const newDirection = value > prevValue.current ? "up" : "down";
    const newClass = newDirection === "up" ? "flash-up" : "flash-down";

    setFlashClass(newClass);
    setDirection(newDirection);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Remove flash class after duration
    timeoutRef.current = setTimeout(() => {
      setFlashClass("");
      setDirection(null);
    }, flashDuration);

    prevValue.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, flashDuration]);

  return { flashClass, direction };
}

/**
 * Combined hook for animated, flashing numbers.
 * The ultimate premium number display hook.
 */
export function useAnimatedNumber(
  target: number,
  options: {
    duration?: number;
    decimals?: number;
    flashDuration?: number;
  } = {},
) {
  const { duration = 1200, decimals = 0, flashDuration = 600 } = options;

  const displayValue = useCountUp(target, duration, decimals);
  const { flashClass, direction } = useValueFlash(target, flashDuration);

  return {
    displayValue,
    flashClass,
    direction,
    // Convenience: combined class string for styling
    className: `tabular-nums ${flashClass}`.trim(),
  };
}

export default useCountUp;
