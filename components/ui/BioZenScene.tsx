'use client';

export default function BioZenScene() {
  return (
    <section className="biozen-wrapper">
      <svg
        viewBox="0 0 1200 340"
        xmlns="http://www.w3.org/2000/svg"
        className="biozen-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4EDE0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#e8f0e4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A9A7B" />
            <stop offset="100%" stopColor="#3D4A3A" />
          </linearGradient>
        </defs>

        <rect width="1200" height="340" fill="url(#bgGrad)" rx="0" />

        {/* Planta izquierda — Romero */}
        <g transform="translate(80, 280)">
          <line x1="0" y1="0" x2="-20" y2="-200" stroke="url(#stemGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="-220" stroke="url(#stemGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="20" y2="-195" stroke="url(#stemGrad)" strokeWidth="2.5" strokeLinecap="round" />
          {[-200,-180,-160,-140,-120,-100,-80].map((y, i) => (
            <g key={i}>
              <ellipse cx={-20 + i*1.5} cy={y} rx="3" ry="10" fill="#8A9A7B" opacity="0.85" transform={`rotate(${-30 + i*5}, ${-20+i*1.5}, ${y})`} />
              <ellipse cx={i*1.5} cy={y-10} rx="3" ry="10" fill="#8A9A7B" opacity="0.9" transform={`rotate(10, ${i*1.5}, ${y-10})`} />
              <ellipse cx={20 + i*1} cy={y+5} rx="3" ry="10" fill="#8A9A7B" opacity="0.8" transform={`rotate(25, ${20+i}, ${y+5})`} />
            </g>
          ))}
        </g>

        {/* Planta centro-izquierda — Lavanda */}
        <g transform="translate(300, 290)">
          {[-3,-1,0,1,3].map((dx, i) => (
            <g key={i}>
              <line x1={dx*8} y1="0" x2={dx*6} y2="-190" stroke="url(#stemGrad)" strokeWidth="2" strokeLinecap="round" />
              {[-190,-175,-160,-145,-130,-115].map((y, j) => (
                <ellipse key={j} cx={dx*6 + (j%2===0?-5:5)} cy={y} rx="4" ry="7"
                  fill="#9C5A3C" opacity={0.6 + j*0.05}
                  transform={`rotate(${dx*15}, ${dx*6+(j%2===0?-5:5)}, ${y})`} />
              ))}
            </g>
          ))}
        </g>

        {/* Centro — célula vegetal estilizada */}
        <g transform="translate(600, 170)">
          <circle cx="0" cy="0" r="80" fill="none" stroke="#8A9A7B" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          <circle cx="0" cy="0" r="55" fill="#F4EDE0" stroke="#B8935A" strokeWidth="1.5" opacity="0.8" />
          <circle cx="0" cy="0" r="25" fill="#8A9A7B" opacity="0.3" />
          <circle cx="0" cy="0" r="12" fill="#3D4A3A" opacity="0.5" />
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <line key={i}
              x1={Math.cos(angle*Math.PI/180)*25}
              y1={Math.sin(angle*Math.PI/180)*25}
              x2={Math.cos(angle*Math.PI/180)*55}
              y2={Math.sin(angle*Math.PI/180)*55}
              stroke="#B8935A" strokeWidth="1" opacity="0.6" />
          ))}
          {[0,72,144,216,288].map((angle, i) => (
            <ellipse key={i}
              cx={Math.cos(angle*Math.PI/180)*80}
              cy={Math.sin(angle*Math.PI/180)*80}
              rx="12" ry="22"
              fill="#8A9A7B" opacity="0.7"
              transform={`rotate(${angle+90}, ${Math.cos(angle*Math.PI/180)*80}, ${Math.sin(angle*Math.PI/180)*80})`} />
          ))}
        </g>

        {/* Planta centro-derecha — Manzanilla */}
        <g transform="translate(900, 285)">
          {[-2,-1,0,1,2].map((dx, i) => (
            <g key={i}>
              <line x1={dx*15} y1="0" x2={dx*10} y2="-170" stroke="url(#stemGrad)" strokeWidth="2" strokeLinecap="round" />
              <circle cx={dx*10} cy={-170} r="10" fill="#F4EDE0" stroke="#B8935A" strokeWidth="1.5" opacity="0.9" />
              <circle cx={dx*10} cy={-170} r="5" fill="#B8935A" opacity="0.8" />
              {[0,45,90,135,180,225,270,315].map((a, j) => (
                <ellipse key={j}
                  cx={dx*10 + Math.cos(a*Math.PI/180)*14}
                  cy={-170 + Math.sin(a*Math.PI/180)*14}
                  rx="3" ry="7"
                  fill="white" opacity="0.85"
                  transform={`rotate(${a+90}, ${dx*10+Math.cos(a*Math.PI/180)*14}, ${-170+Math.sin(a*Math.PI/180)*14})`} />
              ))}
            </g>
          ))}
        </g>

        {/* Planta derecha — Aloe */}
        <g transform="translate(1120, 290)">
          {[-40,-20,0,20,40].map((dx, i) => (
            <ellipse key={i}
              cx={dx}
              cy={-80 + Math.abs(i-2)*10}
              rx="12"
              ry={60 - Math.abs(i-2)*8}
              fill="#8A9A7B"
              opacity={0.6 + (2-Math.abs(i-2))*0.1}
              transform={`rotate(${dx*0.8}, ${dx}, ${-80+Math.abs(i-2)*10})`} />
          ))}
        </g>

        {/* Línea decorativa base */}
        <line x1="60" y1="310" x2="1140" y2="310" stroke="#B8935A" strokeWidth="0.8" opacity="0.3" />

        {/* Partículas botánicas */}
        {[[150,80],[250,120],[450,60],[750,90],[850,130],[1050,70],[1150,100]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#B8935A" opacity={0.2 + i*0.04} />
        ))}
      </svg>

      <style jsx>{`
        .biozen-wrapper {
          width: 100%;
          overflow: hidden;
          padding: 2rem 0;
          background: transparent;
        }
        .biozen-svg {
          width: 100%;
          height: auto;
          max-height: 280px;
          display: block;
        }
      `}</style>
    </section>
  );
}
