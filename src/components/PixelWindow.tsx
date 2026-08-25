// ---------------------------------------------------------------------------
// METRO QUEST — PixelWindow（可重用像素視窗，車站彈窗 / 404 使用）
// ---------------------------------------------------------------------------
import type { ReactNode } from 'react';

interface PixelWindowProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function PixelWindow({ title, onClose, children, className }: PixelWindowProps) {
  return (
    <div className={`mq-window ${className ?? ''}`} role="dialog" aria-label={title}>
      <div className="mq-window__titlebar">
        <span className="mq-window__title">{title}</span>
        {onClose ? (
          <button type="button" className="mq-window__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        ) : null}
      </div>
      <div className="mq-window__body">{children}</div>
    </div>
  );
}
