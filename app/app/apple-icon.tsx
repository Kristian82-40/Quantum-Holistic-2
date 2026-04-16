import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#F7F4EE',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Leaf shape via divs — SVG not fully supported in Satori */}
        <div
          style={{
            width: 70,
            height: 90,
            border: '3px solid #6B7C5E',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              width: 2,
              height: 44,
              background: '#6B7C5E',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
