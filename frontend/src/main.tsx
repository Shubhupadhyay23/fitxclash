import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress expected, non-critical library warnings (Recharts, MediaPipe/WASM)
const originalWarn = console.warn;
const originalInfo = console.info;

console.warn = (...args) => {
  const msg = args[0]?.toString() || '';
  // Recharts size warnings
  if (msg.includes('The width') && msg.includes('height') && msg.includes('chart')) return;
  // MediaPipe coordinate normalization warnings
  if (msg.includes('Using NORM_RECT without IMAGE_DIMENSIONS')) return;
  originalWarn(...args);
};

console.info = (...args) => {
  const msg = args[0]?.toString() || '';
  // TF Lite / MediaPipe CPU delegate initialization info
  if (msg.includes('Created TensorFlow Lite XNNPACK delegate')) return;
  originalInfo(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
