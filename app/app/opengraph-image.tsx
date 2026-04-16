import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Quantum Holistic — Nutrición KM0 & Bienestar con IA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#141610',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          position: 'relative',
        }}
      >
        {/* Decorative circle top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            border: '1px solid rgba(107,124,94,0.25)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: '1px solid rgba(107,124,94,0.15)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 52,
            height: 68,
            border: '2px solid #6B7C5E',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 10,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 1.5,
              height: 28,
              background: '#6B7C5E',
            }}
          />
        </div>

        {/* Tag */}
        <div
          style={{
            display: 'flex',
            fontSize: 14,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#6B7C5E',
            marginBottom: 24,
            fontFamily: 'sans-serif',
          }}
        >
          Nutrición · Bienestar · Inteligencia holística
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 300,
            color: '#F0EDE6',
            lineHeight: 1.1,
            marginBottom: 24,
            fontFamily: 'serif',
            maxWidth: 700,
          }}
        >
          Quantum Holistic
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#9A9A8A',
            fontWeight: 300,
            fontFamily: 'sans-serif',
            maxWidth: 560,
            lineHeight: 1.5,
          }}
        >
          Planes nutricionales km0 y bienestar holístico potenciados por IA.
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 100,
            fontSize: 16,
            color: 'rgba(154,154,138,0.5)',
            letterSpacing: '0.1em',
            fontFamily: 'sans-serif',
          }}
        >
          quantumholistic.com
        </div>
      </div>
    ),
    { ...size }
  );
}
