import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { getPendingRequests, subscribeRequests } from '../lib/requestLoading';

// Keep the painted anatomy joined while the head, jaw and tail move independently.
// Coordinates refer to the original 1536 x 1024 illustration.
const headOutline = 'M0 420H320L345 479L362 486L396 479L420 459L451 461L460 499L515 517L605 513V646H516V700L479 742L443 810L438 930H0Z';
const jawOutline = 'M175 808Q274 834 411 805L439 918H175Z';
const tailOutline = 'M1380 380H1536V560H1380Z';
const cowImage = '/loading/grazing-cow-v2.webp';

export default function CowLoader({ label = 'Loading Farm...', overlay = false, fullPage = false }) {
  const id = `grazing-${useId().replace(/:/g, '')}`;
  const clip = part => `url(#${id}-${part})`;
  return <div className={`cow-loader ${overlay ? 'cow-loader-overlay' : 'cow-loader-panel'} ${fullPage ? 'cow-loader-full-page' : ''}`} role="status" aria-live="polite">
    <div className="cow-loader-content">
      <svg className="cow-loader-scene" viewBox="0 0 800 450" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <image id={`${id}-cow`} href={cowImage} width="1536" height="1024" />
          <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
            <rect width="1536" height="1024" fill="white" />
            <path d={headOutline} fill="black" stroke="white" strokeWidth="36" />
            <path d={tailOutline} fill="black" stroke="white" strokeWidth="10" />
          </mask>
          <clipPath id={`${id}-head`}><path d={headOutline} /></clipPath>
          <mask id={`${id}-jaw-cutout`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
            <rect width="1536" height="1024" fill="white" />
            <path d={jawOutline} fill="black" stroke="white" strokeWidth="14" />
          </mask>
          <clipPath id={`${id}-jaw`}><path d={jawOutline} /></clipPath>
          <clipPath id={`${id}-tail`}><path d={tailOutline} /></clipPath>
        </defs>
        <rect width="800" height="450" fill="#b5d599" />
        <image href="/loading/pasture-v2.webp" width="800" height="450" preserveAspectRatio="xMidYMid slice" />
        <ellipse cx="447" cy="346" rx="169" ry="13" fill="#526b35" opacity=".15" />
        <g transform="translate(136 27) scale(.36)">
          <g className="cow-loader-tail"><use href={`#${id}-cow`} clipPath={clip('tail')} /></g>
          <g className="cow-loader-body"><use href={`#${id}-cow`} mask={clip('body')} /></g>
          <g className="cow-loader-head">
            <use href={`#${id}-cow`} clipPath={clip('head')} mask={clip('jaw-cutout')} />
            <g className="cow-loader-mouth">
              <use href={`#${id}-cow`} clipPath={clip('jaw')} />
              <g strokeLinecap="round" strokeLinejoin="round">
                <path d="M318 855q-5 14-23 23m21-22q12 14 12 24m-12-24q-1 10-10 17" stroke="#4d712f" strokeWidth="7" />
                <path d="m315 855-8 17m10-17 5 19" stroke="#93af42" strokeWidth="3" />
              </g>
            </g>
            <g className="cow-loader-blink">
              <ellipse cx="246" cy="689" rx="13" ry="22" fill="#fcf1dd" />
              <ellipse cx="371" cy="689" rx="14" ry="23" fill="#998b7e" />
              <path d="M236 691q10 7 20-1m105 0q10 8 20 0" stroke="#634536" strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>
        </g>
        <g className="cow-loader-grass" strokeLinecap="round" strokeLinejoin="round">
          <path d="M207 349q0-19-15-35m15 35q9-25 5-40m-5 40q19-18 22-31m-22 31q-13-11-24-13M249 357q-1-22 9-35m-9 35q-17-22-19-35m19 35q14-8 21-17" stroke="#729b38" strokeWidth="5" />
          <path d="m207 349-4-27m3 25 10-22m34 31-7-20" stroke="#a6ba4f" strokeWidth="3" />
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
