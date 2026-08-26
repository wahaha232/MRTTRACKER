// ---------------------------------------------------------------------------
// METRO QUEST — 進入點
// ---------------------------------------------------------------------------
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/pixel.css';
import './styles/metro.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* basename 取自 vite base（/MRTTRACKER/），使 GitHub Pages 子路徑路由正確 */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
