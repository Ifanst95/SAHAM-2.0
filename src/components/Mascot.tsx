import React from 'react';

export const Mascot: React.FC = () => {
  return (
    <figure
      className="mascot"
      role="img"
      aria-label="Maskot kapsul yang awalnya bingung, lalu paham setelah tiga langkah: lihat tren, tunggu tanda, pasang batas rugi"
    >
      <div className="m-disc"></div>
      <svg className="m-svg" viewBox="0 0 100 100" aria-hidden="true">
        <g className="m-rot" transform="translate(50 54) scale(.84) translate(-50 -54)">
          <g className="m-bob">
            <g className="m-tilt">
              <g className="m-rot" transform="rotate(-24 50 52)">
                <path d="M30 38 H50 V66 H30 A14 14 0 0 1 30 38 Z" fill="#f39a8c" />
                <path d="M50 38 H70 A14 14 0 0 1 70 66 H50 Z" fill="#7fd8b5" />
                <rect className="ol" x="16" y="38" width="68" height="28" rx="14" />
                <path className="ol" d="M50 38 V66" />
                <path className="fs" d="M24 46 Q28 43 32 46" strokeWidth="1.8" />
                <g className="m-blink">
                  <g className="m-look">
                    <circle className="fx" cx="60" cy="49" r="2.4" />
                    <circle className="fx" cx="70" cy="49" r="2.4" />
                    <circle cx="60.8" cy="48.2" r=".8" fill="#fff" />
                    <circle cx="70.8" cy="48.2" r=".8" fill="#fff" />
                  </g>
                </g>
                <path className="fs m-sad" d="M61 57 Q63 55.4 65 57 Q67 58.6 69 57" />
                <path className="fs m-happy" d="M61 55.5 Q65 59.5 69 55.5" />
                <g className="m-cheek">
                  <ellipse cx="56.5" cy="54.5" rx="2.4" ry="1.5" fill="#f4a7a0" />
                  <ellipse cx="73.5" cy="54.5" rx="2.4" ry="1.5" fill="#f4a7a0" />
                </g>
              </g>
            </g>
          </g>
        </g>
        <g className="m-q">
          <circle cx="76" cy="21" r="8.5" />
          <text x="76" y="25.6" textAnchor="middle">
            ?
          </text>
        </g>
        <path className="m-spark" d="M77 12 L79.2 18.8 L86 21 L79.2 23.2 L77 30 L74.8 23.2 L68 21 L74.8 18.8 Z" />
        <path className="m-spark s2" d="M14 47 L15.3 51 L19 52.3 L15.3 53.6 L14 57.6 L12.7 53.6 L9 52.3 L12.7 51 Z" />
      </svg>
      <span className="m-chip c1" aria-hidden="true">
        <i>1</i>Lihat tren
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="m-chip c2" aria-hidden="true">
        <i>2</i>Tunggu tanda
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <span className="m-chip c3" aria-hidden="true">
        <i>3</i>Pasang batas rugi
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </figure>
  );
};
