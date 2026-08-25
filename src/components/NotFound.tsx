// ---------------------------------------------------------------------------
// METRO QUEST — 404 Page（提示詞四十六）
// ---------------------------------------------------------------------------
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mq-404">
      <div className="mq-window mq-404__inner">
        <div className="mq-404__code">404</div>
        <div className="mq-404__msg">WORLD NOT FOUND</div>
        <svg width="80" height="24" viewBox="0 0 80 24" aria-hidden="true">
          <rect x="2" y="6" width="60" height="12" fill="#f2f4ff" stroke="#0a0e26" strokeWidth="2" />
          <rect x="2" y="11" width="60" height="3" fill="#ff5d73" />
          <rect x="62" y="7" width="6" height="10" fill="#d5d9f0" stroke="#0a0e26" strokeWidth="2" />
          <rect x="64" y="8" width="3" height="3" fill="#fff6b8" />
          <rect x="8" y="18" width="6" height="4" fill="#1a1f3d" />
          <rect x="26" y="18" width="6" height="4" fill="#1a1f3d" />
          <rect x="44" y="18" width="6" height="4" fill="#1a1f3d" />
        </svg>
        <Link to="/" className="pixel-btn" style={{ textDecoration: 'none' }}>
          RETURN TO MAP
        </Link>
      </div>
    </div>
  );
}
