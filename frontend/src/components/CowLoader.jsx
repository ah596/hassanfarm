import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { getPendingRequests, subscribeRequests } from '../lib/requestLoading';

// Animate the user's original 512 x 512 PNG in overlapping anatomical layers.
// The overlap keeps the neck and jaw connected as the cow bends toward the grass.
const headOutline = 'M416 143H512V259H419L397 225Z';
const jawOutline = 'M435 224H505V255H435Z';
const cowImage = '/loading/animal.png';

export default function CowLoader({ label = 'Loading Farm...', overlay = false, fullPage = false }) {
  const id = `grazing-${useId().replace(/:/g, '')}`;
  const clip = part => `url(#${id}-${part})`;
  return <div className={`cow-loader ${overlay ? 'cow-loader-overlay' : 'cow-loader-panel'} ${fullPage ? 'cow-loader-full-page' : ''}`} role="status" aria-live="polite">
    <div className="cow-loader-content">
      <svg className="cow-loader-scene" viewBox="0 120 600 330" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <image id={`${id}-cow`} href={cowImage} width="512" height="512" />
          <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
            <rect width="512" height="512" fill="white" />
            <path d={headOutline} fill="black" stroke="white" strokeWidth="12" />
          </mask>
          <clipPath id={`${id}-head`}><path d={headOutline} /></clipPath>
          <mask id={`${id}-jaw-cutout`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
            <rect width="512" height="512" fill="white" />
            <path d={jawOutline} fill="black" stroke="white" strokeWidth="6" />
          </mask>
          <clipPath id={`${id}-jaw`}><path d={jawOutline} /></clipPath>
        </defs>
        <ellipse cx="297" cy="278" rx="235" ry="132" fill="#edf4e8" />
        <ellipse cx="299" cy="409" rx="246" ry="8" fill="#dce8d6" />
        <path d="M44 405H559" stroke="#a6bd93" strokeWidth="2" strokeLinecap="round" />
        <g className="cow-loader-body">
          <use href={`#${id}-cow`} mask={clip('body')} />
          <path d="M392 163C408 163 421 156 437 166L450 177L432 208L397 228Z" fill="#000" />
          <g className="cow-loader-head">
            <use href={`#${id}-cow`} clipPath={clip('head')} mask={clip('jaw-cutout')} />
            <g className="cow-loader-mouth">
              <use href={`#${id}-cow`} clipPath={clip('jaw')} />
            </g>
          </g>
        </g>
        <g className="cow-loader-grass">
          <image href="/loading/grass.png" x="403" y="262" width="143" height="143" />
        </g>
      </svg>
      <p className="cow-loader-label">{label}</p>
      <div className="cow-loader-dots" aria-hidden="true"><i/><i/><i/></div>
    </div>
  </div>;
}

export function FarmRequestLoader() {
  const pending = useSyncExternalStore(subscribeRequests, getPendingRequests, getPendingRequests);
  const [visible, setVisible] = useState(false);
  const busy = pending > 0;
  useEffect(() => {
    if (!busy) { setVisible(false); return undefined; }
    const timer = setTimeout(() => setVisible(true), 140);
    return () => clearTimeout(timer);
  }, [busy]);
  return busy && visible ? <CowLoader overlay /> : null;
}
