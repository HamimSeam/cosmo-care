'use client';

import Image from 'next/image';

interface StartScreenProps {
  onStart: () => void;
  exiting?: boolean;
}

export default function StartScreen({ onStart, exiting = false }: StartScreenProps) {
  return (
    <div className={`start-screen${exiting ? ' start-screen--exiting' : ''}`}>
      <div className="start-screen-stars" aria-hidden />
      <div className="start-screen-content">
        <Image
          className="start-screen-logo"
          src="/cosmo-care-logo.png"
          alt="CosmoCare logo"
          width={280}
          height={280}
          priority
        />
        <h1 className="start-screen-title font-mono">COSMOCARE</h1>
        <p className="start-screen-subtitle font-mono">AI Medical Intelligence</p>
        <button
          type="button"
          className="start-screen-btn font-mono"
          onClick={onStart}
          disabled={exiting}
        >
          START
        </button>
      </div>
    </div>
  );
}
