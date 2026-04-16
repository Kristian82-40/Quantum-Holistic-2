import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#F7F4EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
          <path
            d="M11 24C11 24 2 18.5 2 10C2 5.58 6.03 2 11 2C15.97 2 20 5.58 20 10C20 18.5 11 24 11 24Z"
            stroke="#6B7C5E"
            strokeWidth="1.4"
            fill="none"
          />
          <path d="M11 24V11" stroke="#6B7C5E" strokeWidth="1" />
          <path d="M11 17C11 17 6.5 14 4 10.5" stroke="#A8B89A" strokeWidth="0.8" />
          <path d="M11 17C11 17 15.5 14 18 10.5" stroke="#A8B89A" strokeWidth="0.8" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
