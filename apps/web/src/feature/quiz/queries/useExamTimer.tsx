import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementTimeAction,
  startTimerAction,
  stopTimerAction,
  selectTimeRemaining,
  selectIsTimerRunning,
} from "../stores/quiz.store";

interface UseExamTimerOptions {
  attemptId: number;
  onTick?: (seconds: number) => void;
  onExpire?: () => void;
  warningThresholds?: number[];
}

export function useExamTimer({ attemptId, onTick, onExpire, warningThresholds = [300] }: UseExamTimerOptions) {
  const dispatch = useDispatch();
  const timeRemaining = useSelector(selectTimeRemaining);
  const isTimerRunning = useSelector(selectIsTimerRunning);
  const intervalRef = useRef<number | null>(null);
  const warningsShownRef = useRef<Set<number>>(new Set());

  const start = () => {
    dispatch(startTimerAction());
  };

  const stop = () => {
    dispatch(stopTimerAction());
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isTimerRunning || timeRemaining === null) return;

    intervalRef.current = window.setInterval(() => {
      dispatch(decrementTimeAction());
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, dispatch]);

  useEffect(() => {
    if (timeRemaining === null) return;

    if (onTick) {
      onTick(timeRemaining);
    }

    warningThresholds.forEach((threshold) => {
      if (timeRemaining === threshold && !warningsShownRef.current.has(threshold)) {
        warningsShownRef.current.add(threshold);
        const minutes = Math.floor(threshold / 60);
        console.warn(`⏰ Còn ${minutes} phút!`);
      }
    });

    if (timeRemaining <= 0 && isTimerRunning) {
      stop();
      if (onExpire) {
        onExpire();
      }
    }
  }, [timeRemaining, isTimerRunning, onTick, onExpire, warningThresholds]);

  return {
    timeRemaining,
    isRunning: isTimerRunning,
    start,
    stop,
    formatTime: () => formatTime(timeRemaining),
  };
}
