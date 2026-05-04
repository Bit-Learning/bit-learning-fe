import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@workspace/ui/components/Button";
import goldMedalAsset from "../asset/gold_medal.png";
import tomHappyAsset from "../asset/tom_happy.png";

interface RewardDialogProps {
  open: boolean;
  stars: number;
  message: string;
  onNext: () => void;
  onReplay: () => void;
  hasNextLevel: boolean;
}

export function RewardDialog({ open, stars, message, onNext, onReplay, hasNextLevel }: RewardDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center rounded-4xl bg-slate-950/45 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.88, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 8 }}
            className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.24)]"
          >
            <div className="relative mx-auto h-32 w-32">
              <img
                src={tomHappyAsset}
                alt="Tom vui vẻ"
                className="h-full w-full object-contain drop-shadow-lg"
                draggable={false}
              />
              <img
                src={goldMedalAsset}
                alt="Huy chương hoàn thành"
                className="-right-2 -bottom-1 absolute h-14 w-14 object-contain drop-shadow-md"
                draggable={false}
              />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Bạn hoàn thành rồi</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
            <div className="mt-5 flex items-center justify-center gap-2 text-4xl">
              {[1, 2, 3].map((value) => (
                <span key={value} className={value <= stars ? "opacity-100" : "opacity-25"}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onPress={onReplay}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 shadow-none hover:bg-slate-50"
              >
                Chơi lại
              </Button>
              {hasNextLevel && (
                <Button
                  onPress={onNext}
                  className="cursor-pointer rounded-2xl bg-emerald-500 px-5 py-3 text-white hover:bg-emerald-600"
                >
                  Màn tiếp theo
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
