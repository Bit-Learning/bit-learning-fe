import { useCallback, useEffect, useRef } from "react";

export interface BlocklyTourProps {
  onStart?: (startTour: () => void) => void;
}

type AnyDriver = any;

const DRAG_ANIM_STYLE_ID = "blockly-tour-drag-anim";

function injectDragAnimStyles() {
  if (document.getElementById(DRAG_ANIM_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DRAG_ANIM_STYLE_ID;
  style.textContent = `
    @keyframes blt-block-drag {
      0%   { transform: translateX(0px)   translateY(0px)  scale(1);    opacity: 1; }
      5%   { transform: translateX(0px)   translateY(0px)  scale(1.08); opacity: 1; }
      55%  { transform: translateX(200px) translateY(6px)  scale(1.04); opacity: 1; }
      70%  { transform: translateX(200px) translateY(6px)  scale(1);    opacity: 1; }
      82%  { transform: translateX(200px) translateY(6px)  scale(0.96); opacity: 0.7; }
      100% { transform: translateX(200px) translateY(6px)  scale(0.96); opacity: 0; }
    }
    @keyframes blt-cursor-move {
      0%   { left: 60px;  top: 68px; opacity: 1; }
      5%   { left: 60px;  top: 68px; opacity: 1; }
      55%  { left: 260px; top: 74px; opacity: 1; }
      75%  { left: 260px; top: 74px; opacity: 1; }
      90%  { left: 260px; top: 74px; opacity: 0; }
      100% { left: 60px;  top: 68px; opacity: 0; }
    }
    @keyframes blt-drop-zone-pulse {
      0%, 60%  { border-color: #bae6fd; background: transparent; }
      65%, 75% { border-color: #38bdf8; background: rgba(56,189,248,0.15); }
      100%     { border-color: #bae6fd; background: transparent; }
    }
    .blt-stage {
      position: relative;
      height: 148px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e0f2fe;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      margin-top: 14px;
    }
    .blt-toolbox {
      position: absolute; left: 0; top: 0; bottom: 0;
      width: 300px;
      background: rgba(255,255,255,0.9);
      border-right: 1px solid #e0f2fe;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 8px;
      padding: 0 10px;
    }
    .blt-toolbox-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: #94a3b8; margin-bottom: 2px;
    }
    .blt-block {
      display: flex; align-items: center; gap: 6px;
      background: #5ba55b; color: #fff;
      font-size: 13px; font-weight: 700;
      padding: 9px 13px; border-radius: 11px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      white-space: nowrap; user-select: none;
      width: fit-content;
    }
    .blt-block-ghost { opacity: 0.25; }
    .blt-block-animated {
      position: absolute;
      left: 18px; top: 56px;
      animation: blt-block-drag 2.4s cubic-bezier(0.4,0,0.2,1) 0.5s infinite;
      z-index: 10;
    }
    .blt-workspace {
      position: absolute; left: 160px; right: 0; top: 0; bottom: 0;
      display: flex; flex-direction: column;
      padding: 14px 12px 10px;
      gap: 6px;
    }
    .blt-ws-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: #94a3b8; margin-bottom: 2px;
    }
    .blt-start-block {
      display: flex; align-items: center; gap: 6px;
      background: #3d7bbe; color: #fff;
      font-size: 13px; font-weight: 700;
      padding: 9px 13px; border-radius: 11px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.14);
      width: fit-content; user-select: none;
    }
    .blt-drop-zone {
      width: 138px; height: 34px;
      border: 2px dashed #bae6fd;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #7dd3fc; font-weight: 600;
      animation: blt-drop-zone-pulse 2.4s ease-in-out 0.5s infinite;
    }
    .blt-cursor {
      position: absolute;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #0ea5e9;
      border: 2px solid #fff;
      box-shadow: 0 2px 10px rgba(14,165,233,0.55);
      pointer-events: none; z-index: 20;
      animation: blt-cursor-move 2.4s cubic-bezier(0.4,0,0.2,1) 0.5s infinite;
    }
    .blockly-tour-popover.driver-popover {
      max-width: 480px !important;
    }
    .blockly-tour-popover.driver-popover .driver-popover-title {
      font-size: 20px !important;
    }
    .blockly-tour-popover.driver-popover .driver-popover-description {
      font-size: 15px !important;
      line-height: 1.8 !important;
    }
  `;
  document.head.appendChild(style);
}

const DRAG_DEMO_HTML = `
  <div class="blt-stage">
    <div class="blt-toolbox">
      <div class="blt-toolbox-label">Hộp khối</div>
      <div class="blt-block blt-block-ghost">⬆️ Đi thẳng 1 ô</div>
    </div>
    <div class="blt-block blt-block-animated">⬆️ Đi thẳng 1 ô</div>
    <div class="blt-workspace">
      <div class="blt-ws-label">Sân lập trình</div>
      <div class="blt-start-block">🚩 Bắt đầu</div>
      <div class="blt-drop-zone">thả vào đây ↑</div>
    </div>
    <div class="blt-cursor"></div>
  </div>
`;

const TOTAL_STEPS = 10;

const ALL_STEPS = [
  {
    popover: {
      title: "👋 Chào mừng đến Kids Blockly!",
      description:
        "Hãy để Tom hướng dẫn bạn cách chơi nhé. Bạn sẽ kéo các khối lệnh để dẫn đường cho nhân vật đến đích.",
    },
  },
  {
    element: "[data-tour='gameboard']",
    popover: {
      title: "🗺️ Sân chơi",
      description:
        "Đây là nơi nhân vật Tom di chuyển. Ô có cờ 🚩 là điểm bắt đầu, ô có đích là nơi Tom cần đến. Các vật cản trên đường sẽ chặn Tom lại!",
      side: "right",
    },
  },
  {
    element: "[data-tour='hint-btn']",
    popover: {
      title: "💡 Nút Gợi ý",
      description: "Bí quá không biết làm thế nào? Bấm vào đây để xem gợi ý cho màn chơi hiện tại.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='workspace']",
    popover: {
      title: "🧩 Sân lập trình",
      description:
        "Kéo các khối lệnh từ thanh bên trái vào đây và nối chúng xuống dưới khối 🚩 Bắt đầu. Mỗi khối là một hành động Tom sẽ thực hiện theo thứ tự từ trên xuống.",
      side: "left",
    },
  },
  {
    element: "[data-tour='toolbox']",
    popover: {
      title: "📦 Hộp khối lệnh",
      description: `Đây là các khối bạn được dùng trong màn này. Kéo chúng vào sân bên phải để lắp ghép chương trình.${DRAG_DEMO_HTML}`,
      side: "right",
      popoverClass: "blockly-tour-popover blockly-tour-popover--wide",
    },
  },
  {
    element: "[data-tour='step-count']",
    popover: {
      title: "🔢 Số bước",
      description:
        "Hiển thị số khối lệnh bạn đang dùng. Càng ít bước càng tốt — dùng đúng mốc par để đạt 3 sao ⭐⭐⭐!",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='run-btn']",
    popover: {
      title: "▶️ Nút Chạy",
      description:
        "Khi đã xếp xong các khối, bấm Chạy để Tom thực hiện chương trình. Hãy xem Tom có đến được đích không nhé!",
      side: "top",
    },
  },
  {
    element: "[data-tour='replay-btn']",
    popover: {
      title: "🔄 Chạy lại",
      description: "Đặt Tom về vị trí ban đầu và chạy lại chương trình hiện tại mà không xóa các khối.",
      side: "top",
    },
  },
  {
    element: "[data-tour='clear-btn']",
    popover: {
      title: "🗑️ Xóa hết",
      description: "Xóa toàn bộ các khối lệnh để bắt đầu lại từ đầu.",
      side: "top",
    },
  },
  {
    element: "[data-tour='level-grid'] > button:first-child",
    popover: {
      title: "🗂️ Chọn màn chơi",
      description:
        "Hoàn thành màn hiện tại để mở khóa màn tiếp theo. Số sao ★ bên dưới thể hiện kết quả tốt nhất của bạn.",
      side: "top",
      align: "start",
    },
  },
];

export function useBlocklyTour() {
  const driverRef = useRef<AnyDriver>(null);

  const startTour = useCallback(async () => {
    try {
      driverRef.current?.destroy();
      driverRef.current = null;

      injectDragAnimStyles();

      const mod = await import("driver.js");
      import("driver.js/dist/driver.css").catch(() => undefined);

      const fn: ((cfg: AnyDriver) => AnyDriver) | undefined =
        (mod as any).driver ??
        (mod as any).default?.driver ??
        (typeof (mod as any).default === "function" ? (mod as any).default : undefined);

      if (!fn) return;

      const d = fn({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        steps: ALL_STEPS,
        nextBtnText: "Tiếp tục →",
        prevBtnText: "Quay lại",
        doneBtnText: "Hoàn tất 🎉",
        progressText: `{{current}} / ${TOTAL_STEPS}`,
        popoverClass: "blockly-tour-popover",
        smoothScroll: true,
        allowClose: true,
        stagePadding: 12,
        stageRadius: 16,
        onDestroyed: () => {
          driverRef.current = null;
        },
      });

      driverRef.current = d;
      d.drive();
    } catch (err) {
      console.error("[BlocklyTour]", err);
    }
  }, []);

  useEffect(
    () => () => {
      driverRef.current?.destroy();
    },
    [],
  );

  return { startTour };
}

export function BlocklyTour({ onStart }: BlocklyTourProps) {
  const { startTour } = useBlocklyTour();
  useEffect(() => {
    onStart?.(startTour);
  }, [onStart, startTour]);
  return null;
}
