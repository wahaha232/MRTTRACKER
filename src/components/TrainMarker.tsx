// ---------------------------------------------------------------------------
// METRO QUEST — Pixel Train（提示詞十）
// 自製像素列車：車頭 / 車窗 / 車身 / 車燈 / 車輪 / route color stripe。
// 面朝東方；由 MetroMap 依 heading 旋轉。
// ---------------------------------------------------------------------------

interface TrainMarkerProps {
  color: string;
  selected: boolean;
  delayed: boolean;
  trainId: string;
  onClick: () => void;
}

export function TrainMarker({ color, selected, delayed, trainId, onClick }: TrainMarkerProps) {
  return (
    <g
      className={`mq-train${selected ? ' mq-train--selected' : ''}${delayed ? ' mq-train--delay' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Train ${trainId}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* hit area */}
      <rect className="mq-train__hit" x="-26" y="-15" width="52" height="30" />
      {/* 車身 */}
      <rect className="mq-train__body" x="-22" y="-10" width="36" height="12" />
      {/* 車頂 */}
      <rect x="-20" y="-9" width="32" height="2" fill="#c9cfe8" stroke="#0a0e26" strokeWidth="0.6" />
      {/* route color stripe */}
      <rect className="mq-train__stripe" x="-22" y="-3" width="36" height="3" fill={color} stroke="#0a0e26" strokeWidth="0.6" />
      {/* 車窗 */}
      <rect className="mq-train__window" x="-18" y="-8" width="6" height="4" />
      <rect className="mq-train__window" x="-10" y="-8" width="6" height="4" />
      <rect className="mq-train__window" x="-2" y="-8" width="6" height="4" />
      {/* 車頭 */}
      <rect x="14" y="-9" width="3" height="10" fill="#d5d9f0" stroke="#0a0e26" strokeWidth="0.8" />
      {/* 車頭燈 */}
      <rect className="mq-train__light" x="15" y="-7" width="2" height="2" />
      {/* 車輪 */}
      <rect x="-18" y="2" width="4" height="3" fill="#1a1f3d" />
      <rect x="-6" y="2" width="4" height="3" fill="#1a1f3d" />
      <rect x="6" y="2" width="4" height="3" fill="#1a1f3d" />
      <rect x="14" y="2" width="3" height="3" fill="#1a1f3d" />
    </g>
  );
}

/** heading → 旋轉角度（面東為 0 度） */
export const HEADING_ROTATION: Record<string, number> = {
  E: 0,
  NE: -45,
  N: -90,
  NW: -135,
  W: 180,
  SW: 135,
  S: 90,
  SE: 45,
};
