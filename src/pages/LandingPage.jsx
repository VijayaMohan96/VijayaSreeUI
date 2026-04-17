import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../assets/hero.png'

/* ─── Data ─────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  { name: 'Ravi Naidu',      village: 'Kuppam',          crop: 'Paddy',           stars: 5, quote: 'VST has been my go-to shop for 15 years. Their pest management advice saved my paddy crop from brown planthopper last season.' },
  { name: 'Lakshmi Devi',    village: 'Obulavaripalli',  crop: 'Chilli & Tomato', stars: 5, quote: 'The quality of fertilizers here is unmatched. My tomato yield doubled after following their soil health recommendations.' },
  { name: 'Suresh Babu',     village: 'Vayalpadu',       crop: 'Cotton',          stars: 5, quote: 'I travel 25 km specifically to buy from VST. Their credit facility during lean seasons has helped my family through many harvests.' },
  { name: 'Manjula Reddy',   village: 'Madanapalli',     crop: 'Groundnut',       stars: 5, quote: 'Best agricultural shop in Chittoor district. Genuine products and honest guidance every single time without fail.' },
  { name: 'Krishnarao',      village: 'Piler',           crop: 'Tomato',          stars: 5, quote: 'Rama Mohan garu personally explained the right fertilizer schedule for my tomato crop. That kind of attention is rare.' },
  { name: 'Venkat Swamy',    village: 'Gudipala',        crop: 'Maize',           stars: 5, quote: 'My maize crop quality improved dramatically after switching entirely to VST recommended products three seasons ago.' },
  { name: 'Saraswati',       village: 'Thamballapalle',  crop: 'Sunflower',       stars: 5, quote: 'Trust is the word. Twelve years with VST and I have never once received a counterfeit or expired product from them.' },
  { name: 'Narasimha Rao',   village: 'Penumur',         crop: 'Paddy',           stars: 5, quote: 'They stock every brand I need. Never had to go anywhere else in the past decade. Excellent stock maintenance.' },
  { name: 'Padmaja',         village: 'Punganur',        crop: 'Chilli',          stars: 5, quote: 'The staff understands our local soil conditions better than any consultant. Crop-specific guidance that actually works.' },
  { name: 'Hanumantha Rao',  village: 'Nagalapuram',     crop: 'Cotton',          stars: 5, quote: 'Fair pricing, genuine products, flexible credit. What more can a farmer ask for? VST delivers on all three, consistently.' },
  { name: 'Geetha Devi',     village: 'Kurabalakota',    crop: 'Vegetables',      stars: 5, quote: 'VST recommended integrated pest management that cut my chemical costs by 30%. That kind of advice is invaluable.' },
  { name: 'Tirupathi Reddy', village: 'Kalikiri',        crop: 'Groundnut',       stars: 5, quote: 'Been coming here since 2006. The consistency in product quality and advice has never wavered over all these years.' },
  { name: 'Ramakrishna',     village: 'Pakala',          crop: 'Tomato',          stars: 5, quote: 'My entire village switched to VST. The home delivery service they added recently is a game changer for all of us.' },
  { name: 'Ananthamma',      village: 'Mulakalacheruvu', crop: 'Maize',           stars: 5, quote: 'The fertilizer schedule they gave me improved my maize yield by nearly 40% this season. Cannot thank them enough.' },
  { name: 'Bhaskar Rao',     village: 'Ramakuppam',      crop: 'Paddy',           stars: 5, quote: 'Very knowledgeable team. They stay updated on new pest threats every season and give timely alerts to all customers.' },
  { name: 'Kamala',          village: 'Chinthaparthi',   crop: 'Vegetables',      stars: 5, quote: 'VST helped me transition to drip-compatible fertilizers. My water and input costs dropped very significantly.' },
  { name: 'Srinivasa Rao',   village: 'B. Kothakota',    crop: 'Sugarcane',       stars: 5, quote: 'The micronutrient blends from VST fixed the yellowing in my cane crop that other shops completely failed to diagnose.' },
  { name: 'Nagamani',        village: 'Sodam',           crop: 'Chilli',          stars: 5, quote: 'Genuine products, fair price, always in stock during the season. No hunting around. VST is simply the most reliable.' },
]

const VIDEO_TESTI = [
  { name: 'Ravi Kumar',    village: 'Kuppam',   crop: 'Tomato Farmer',  duration: '2:34', thumb: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=700&q=70' },
  { name: 'Gopal Reddy',  village: 'Piler',    crop: 'Paddy Farmer',   duration: '1:58', thumb: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=700&q=70' },
  { name: 'Anand Rao',    village: 'Punganur', crop: 'Chilli Farmer',  duration: '3:12', thumb: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=700&q=70' },
]

const COMPANY_BRANDS = [
  { name: 'Bayer CropScience',       short: 'Bayer',      bg: '#10307A', text: '#fff'    },
  { name: 'Syngenta',                short: 'Syngenta',   bg: '#00853F', text: '#fff'    },
  { name: 'UPL Limited',             short: 'UPL',        bg: '#F36523', text: '#fff'    },
  { name: 'PI Industries',           short: 'PI Ind.',    bg: '#003087', text: '#fff'    },
  { name: 'Coromandel International',short: 'Coromandel', bg: '#C8102E', text: '#fff'    },
  { name: 'IFFCO',                   short: 'IFFCO',      bg: '#0D5FA8', text: '#fff'    },
  { name: 'Godrej Agrovet',          short: 'Godrej',     bg: '#6B2D8B', text: '#fff'    },
  { name: 'Rallis India',            short: 'Rallis',     bg: '#D4282A', text: '#fff'    },
  { name: 'Dhanuka Agritech',        short: 'Dhanuka',    bg: '#008B46', text: '#fff'    },
  { name: 'Tata Chemicals',          short: 'Tata',       bg: '#2A5EAB', text: '#fff'    },
  { name: 'Insecticides India',      short: 'IIL',        bg: '#E8352A', text: '#fff'    },
  { name: 'Sumitomo Chemical',       short: 'Sumitomo',   bg: '#1B3A6B', text: '#fff'    },
]

const PRODUCTS = [
  { icon: '🌿', name: 'Pesticides',      desc: 'Broad-spectrum insecticides, fungicides & bactericides for all major crops' },
  { icon: '🌾', name: 'Fertilizers',     desc: 'NPK blends, micronutrient mixtures and specialty nutrients for optimal yield' },
  { icon: '🌱', name: 'Seeds',           desc: 'Certified hybrid seeds for paddy, groundnut, chillies and vegetables' },
  { icon: '🍃', name: 'Herbicides',      desc: 'Pre-emergent and post-emergent weed control solutions' },
  { icon: '⚗️', name: 'Micronutrients',  desc: 'Zinc, boron, iron and calcium supplements for deficiency management' },
  { icon: '🛡️', name: 'Crop Protection', desc: 'Biological controls, plant growth regulators and protective sprays' },
]

const STATS = [
  { value: 25,  suffix: '+',  label: 'Years in Service'  },
  { value: 500, suffix: '+',  label: 'Products Stocked'  },
  { value: 10,  suffix: 'K+', label: 'Farmers Served'    },
  { value: 50,  suffix: '+',  label: 'Villages Covered'  },
]

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=70', label: 'Tomato' },
  { src: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&q=70', label: 'Paddy' },
  { src: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=70', label: 'Chilli' },
  { src: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=70', label: 'Cotton' },
  { src: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=70', label: 'Mango' },
  { src: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&q=70', label: 'Groundnut' },
]

/* ─── Sub-components ────────────────────────────────────────────── */

/* Plant / seedling logo — used in the nav */

/* VST circular logo — dark variant for light backgrounds (nav) */
function VSTLogoNav({ size = 40 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.43
  const sw = size * 0.065, circ = 2 * Math.PI * r
  const big = circ * 0.63, small = circ * 0.37
  const fs1 = size * 0.175, fs2 = size * 0.215
  const off1 = size * 0.265, off2 = size * 0.27
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4a9e4a" strokeWidth={sw}
        strokeDasharray={`${big} ${small}`} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84b" strokeWidth={sw}
        strokeDasharray={`${small} ${big}`} strokeDashoffset={-big} strokeLinecap="round"/>
      <text x={cx} y={cy - off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(26,60,26,0.65)" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx - off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#4a9e4a" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx} y={cy} fontFamily="Georgia,serif" fontSize={fs2} fontWeight="700"
        fill="#1a3c1a" textAnchor="middle" dominantBaseline="central">S</text>
      <text x={cx + off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#c8a84b" textAnchor="middle" dominantBaseline="central">T</text>
      <text x={cx} y={cy + off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(26,60,26,0.65)" textAnchor="middle" dominantBaseline="central">T</text>
    </svg>
  )
}

/* VST circular logo — light variant for dark backgrounds (footer) */
function VSTLogo({ size = 44 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.43
  const sw = size * 0.065, circ = 2 * Math.PI * r
  const big = circ * 0.63, small = circ * 0.37
  const fs1 = size * 0.175, fs2 = size * 0.215
  const off1 = size * 0.265, off2 = size * 0.27
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4a9e4a" strokeWidth={sw}
        strokeDasharray={`${big} ${small}`} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84b" strokeWidth={sw}
        strokeDasharray={`${small} ${big}`} strokeDashoffset={-big} strokeLinecap="round"/>
      <text x={cx} y={cy - off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx - off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#4a9e4a" textAnchor="middle" dominantBaseline="central">V</text>
      <text x={cx} y={cy} fontFamily="Georgia,serif" fontSize={fs2} fontWeight="700"
        fill="#ffffff" textAnchor="middle" dominantBaseline="central">S</text>
      <text x={cx + off2} y={cy} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="#c8a84b" textAnchor="middle" dominantBaseline="central">T</text>
      <text x={cx} y={cy + off1} fontFamily="Georgia,serif" fontSize={fs1} fontWeight="700"
        fill="rgba(255,255,255,0.85)" textAnchor="middle" dominantBaseline="central">T</text>
    </svg>
  )
}

function Stars({ n = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < n ? '#c8a84b' : '#d4c9a8', fontSize: '13px', lineHeight: 1 }}>★</span>
      ))}
    </div>
  )
}

function CountUp({ value, suffix }) {
  const [display, setDisplay] = useState(0)
  const ref    = useRef(null)
  const fired  = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true
        const steps = 60, dur = 1600
        let i = 0
        const tick = setInterval(() => {
          i++
          const t = 1 - Math.pow(1 - i / steps, 3)
          setDisplay(Math.round(t * value))
          if (i >= steps) { setDisplay(value); clearInterval(tick) }
        }, dur / steps)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return <span ref={ref}>{display}{suffix}</span>
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const E = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Telugu:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .lp {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #faf8f3;
    color: #1a2a18;
    overflow-x: hidden;
  }

  /* ── Nav ── */
  .lp-nav {
    position: sticky; top: 0; z-index: 100;
    height: 60px; display: flex; align-items: center;
    background: rgba(250,248,243,0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(26,60,26,0.08);
    transition: box-shadow 0.3s ${E};
  }
  .lp-nav.raised { box-shadow: 0 2px 20px rgba(26,60,26,0.09); }
  .lp-nav-inner {
    width: 100%; max-width: 1100px; margin: 0 auto;
    padding: 0 36px; display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: default; }
  .nav-brand-text { line-height: 1.15; }
  .nav-brand-name { font-size: 14px; font-weight: 800; color: #1a3c1a; letter-spacing: 1.8px; font-family: Georgia, serif; }
  .nav-brand-sub  { font-size: 9px; color: #8a9e88; letter-spacing: 2.5px; font-weight: 600; margin-top: 1px; }
  .nav-links { display: flex; align-items: center; gap: 2px; }
  .nav-links button {
    background: none; border: none; padding: 7px 14px;
    font-size: 14px; font-weight: 500; color: #3a4a38;
    cursor: pointer; border-radius: 8px; font-family: inherit;
    transition: color 0.15s ${E}, background 0.15s ${E};
  }
  .nav-links button:hover { color: #1a3c1a; background: rgba(26,60,26,0.06); }
  .nav-staff {
    font-size: 13px; font-weight: 600; color: #2d6a2d;
    background: none; border: 1.5px solid rgba(45,106,45,0.3);
    border-radius: 980px; padding: 7px 18px;
    cursor: pointer; font-family: inherit; letter-spacing: 0.1px;
    transition: all 0.18s ${E};
    display: flex; align-items: center; gap: 5px;
  }
  .nav-staff:hover { background: #2d6a2d; color: #fff; border-color: #2d6a2d; }
  .nav-staff .arrow { transition: transform 0.18s ${E}; }
  .nav-staff:hover .arrow { transform: translateX(3px); }

  /* ── Hero ── */
  .lp-hero {
    min-height: 100vh; position: relative;
    display: flex; align-items: center; justify-content: center;
    text-align: center; padding: 100px 40px 80px;
    background-size: cover; background-position: center 40%; overflow: hidden;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(170deg, rgba(8,22,6,0.74) 0%, rgba(15,40,10,0.62) 45%, rgba(25,18,8,0.70) 100%);
  }
  .hero-content { position: relative; z-index: 1; max-width: 800px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #c8a84b;
    background: rgba(200,168,75,0.12); border: 1px solid rgba(200,168,75,0.3);
    padding: 6px 16px; border-radius: 100px; margin-bottom: 28px;
    opacity: 0; animation: riseIn 1s ${E} 0.1s forwards;
  }
  .badge-dot {
    width: 6px; height: 6px; background: #c8a84b; border-radius: 50%;
    animation: pulse 2.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.35; transform:scale(0.65); } }

  /* Telugu headline */
  .hero-title {
    font-family: "Noto Serif Telugu", Georgia, serif;
    font-size: clamp(32px, 5.5vw, 68px);
    font-weight: 700;
    color: #f5f2e8;
    line-height: 1.25;
    letter-spacing: 0.01em;
    margin-bottom: 14px;
    opacity: 0;
    animation: riseIn 1s ${E} 0.3s forwards;
  }
  .hero-sub-telugu {
    font-family: "Noto Serif Telugu", Georgia, serif;
    font-size: clamp(22px, 3.5vw, 42px);
    font-weight: 600;
    color: #c8a84b;
    line-height: 1.3;
    margin-bottom: 22px;
    opacity: 0;
    animation: riseIn 1s ${E} 0.5s forwards;
    display: block;
  }
  .hero-sub {
    font-size: clamp(14px, 1.6vw, 17px);
    color: rgba(245,242,232,0.58);
    line-height: 1.7; max-width: 520px; margin: 0 auto 38px;
    font-weight: 300;
    opacity: 0; animation: riseIn 1s ${E} 0.65s forwards;
  }
  .hero-ctas {
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    opacity: 0; animation: riseIn 1s ${E} 0.8s forwards;
  }
  .cta-primary {
    padding: 14px 30px; background: #c8a84b; color: #1a1a0a;
    border: none; border-radius: 980px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: inherit; letter-spacing: 0.1px;
    transition: background 0.2s ${E}, transform 0.2s ${E}, box-shadow 0.2s ${E};
  }
  .cta-primary:hover { background: #d8ba60; transform: scale(1.03); box-shadow: 0 10px 28px rgba(200,168,75,0.45); }
  .cta-outline {
    padding: 14px 30px; background: transparent; color: rgba(245,242,232,0.9);
    border: 1.5px solid rgba(245,242,232,0.3); border-radius: 980px;
    font-size: 15px; font-weight: 500; cursor: pointer; font-family: inherit;
    transition: background 0.2s ${E}, border-color 0.2s ${E};
  }
  .cta-outline:hover { background: rgba(245,242,232,0.1); border-color: rgba(245,242,232,0.6); }
  .hero-scroll {
    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
    z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0; animation: fadeIn 1s ${E} 1.2s forwards;
  }
  .hero-scroll span { font-size: 10px; letter-spacing: 2.5px; color: rgba(245,242,232,0.3); font-weight: 600; }
  .scroll-stem {
    width: 1px; height: 44px;
    background: linear-gradient(to bottom, rgba(200,168,75,0.7), transparent);
    animation: stemPulse 2.2s ease-in-out infinite;
  }
  @keyframes stemPulse { 0%,100% { opacity:1; transform:scaleY(1) translateY(0); } 60% { opacity:0.25; transform:scaleY(0.45) translateY(-8px); } }

  /* ── Stats ── */
  .lp-stats { background: #1a3c1a; }
  .stats-row {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(4, 1fr);
  }
  .stat-cell {
    padding: 48px 24px; text-align: center;
    border-right: 1px solid rgba(255,255,255,0.07);
    position: relative; overflow: hidden;
  }
  .stat-cell::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, rgba(200,168,75,0.07) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.4s ${E};
  }
  .stat-cell:hover::before { opacity: 1; }
  .stat-cell:last-child { border-right: none; }
  .stat-num {
    font-size: clamp(38px, 4.5vw, 56px); font-weight: 700; color: #c8a84b;
    font-family: Georgia, serif; line-height: 1; letter-spacing: -0.02em; margin-bottom: 10px;
  }
  .stat-lbl { font-size: 13px; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; }

  /* ── Section scaffolding ── */
  .lp-sec { padding: 112px 40px; }
  .sec-cream  { background: #faf8f3; color: #1a2a18; }
  .sec-white  { background: #ffffff; color: #1a2a18; }
  .sec-green  { background: #1a3c1a; color: #f5f2e8; }
  .sec-field  { background: #f2f7ee; color: #1a2a18; }
  .sec-dark   { background: #0f2210; color: #f5f2e8; }

  .eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 3.5px; color: #4a9e4a;
    margin-bottom: 14px; display: block;
  }
  .sec-green .eyebrow, .sec-dark .eyebrow { color: #c8a84b; }
  .sec-title {
    font-size: clamp(28px, 3.2vw, 46px); font-weight: 700;
    letter-spacing: -0.025em; line-height: 1.1; margin-bottom: 18px;
    font-family: Georgia, "Times New Roman", serif;
  }
  .sec-body { font-size: 17px; line-height: 1.7; color: #5a6a58; max-width: 560px; }
  .sec-green .sec-body, .sec-dark .sec-body { color: rgba(245,242,232,0.5); }
  .centered { text-align: center; }
  .centered .sec-body { margin: 0 auto; }

  /* ── Reveal ── */
  .reveal {
    opacity: 0; transform: translateY(26px);
    transition: opacity 0.78s ${E}, transform 0.78s ${E};
  }
  .reveal.in { opacity: 1; transform: none; }

  /* ── About ── */
  .about-grid {
    max-width: 1060px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  /* Bilingual paragraphs — side by side */
  .bilingual-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(26,60,26,0.07);
  }
  .bilingual-block:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
  .bilingual-te {
    font-family: "Noto Serif Telugu", Georgia, serif;
    font-size: 17px; line-height: 2; color: #1a2a18; font-weight: 500;
    padding-right: 20px;
    border-right: 1.5px solid rgba(74,158,74,0.2);
  }
  .bilingual-en {
    font-size: 14.5px; line-height: 1.8; color: #6a7a68;
    padding-left: 6px;
  }

  .about-points { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
  .about-point { display: flex; align-items: flex-start; gap: 10px; }
  .point-dot { width: 7px; height: 7px; background: #4a9e4a; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
  .point-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
    width: 100%;
  }
  .point-te {
    font-family: "Noto Serif Telugu", Georgia, serif;
    font-size: 16px; color: #1a2a18; line-height: 1.9; font-weight: 500;
    padding-right: 14px;
    border-right: 1.5px solid rgba(74,158,74,0.2);
  }
  .point-en { font-size: 14px; color: #8a9a88; line-height: 1.75; padding-left: 4px; }
  .about-mosaic { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mosaic-img {
    width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 14px;
    transition: transform 0.45s ${E}, box-shadow 0.45s ${E};
  }
  .mosaic-img:hover { transform: scale(1.04); box-shadow: 0 20px 48px rgba(26,60,26,0.18); }
  .mosaic-img:nth-child(2) { margin-top: 28px; }
  .mosaic-img:nth-child(4) { margin-top: -28px; }

  /* ── Products ── */
  .products-wrap {
    max-width: 1060px; margin: 56px auto 0;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  }
  .product-card {
    background: #fff; border: 1.5px solid rgba(26,60,26,0.08);
    border-radius: 18px; padding: 36px 28px;
    transition: border-color 0.25s ${E}, transform 0.25s ${E}, box-shadow 0.25s ${E};
    cursor: default;
  }
  .product-card:hover { border-color: #4a9e4a; transform: translateY(-5px); box-shadow: 0 16px 40px rgba(26,60,26,0.10); }
  .p-icon { font-size: 36px; margin-bottom: 18px; line-height: 1; }
  .p-name { font-size: 18px; font-weight: 700; color: #1a2a18; margin-bottom: 8px; letter-spacing: -0.01em; font-family: Georgia, serif; }
  .p-desc { font-size: 14px; color: #6a7a68; line-height: 1.65; }

  /* ── Video testimonials ── */
  .lp-video { padding: 112px 40px; }
  .video-grid {
    max-width: 1060px; margin: 52px auto 0;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
  }
  .video-card {
    border-radius: 18px; overflow: hidden;
    box-shadow: 0 4px 24px rgba(26,60,26,0.10);
    transition: transform 0.3s ${E}, box-shadow 0.3s ${E};
    cursor: pointer; background: #1a3c1a;
  }
  .video-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(26,60,26,0.18); }
  .video-thumb {
    position: relative; aspect-ratio: 16/10; overflow: hidden;
  }
  .video-thumb img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75); transition: filter 0.3s ${E}; }
  .video-card:hover .video-thumb img { filter: brightness(0.6); }
  .video-play {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  }
  .play-btn {
    width: 56px; height: 56px; background: rgba(200,168,75,0.92);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #1a1a0a;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
    transition: transform 0.25s ${E}, background 0.25s ${E};
  }
  .video-card:hover .play-btn { transform: scale(1.1); background: #c8a84b; }
  .video-duration {
    position: absolute; bottom: 10px; right: 12px;
    font-size: 11px; font-weight: 600; color: #fff;
    background: rgba(0,0,0,0.55); padding: 2px 8px; border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .video-info { padding: 18px 20px; }
  .video-farmer { font-size: 15px; font-weight: 700; color: #f5f2e8; margin-bottom: 4px; }
  .video-meta   { font-size: 13px; color: rgba(245,242,232,0.5); }

  /* ── Text testimonials marquee ── */
  .lp-testi { padding: 112px 0; }
  .testi-header { text-align: center; padding: 0 40px 60px; }
  .marquee-clip {
    overflow: hidden; width: 100%;
    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
  }
  .marquee-row { display: flex; gap: 16px; width: max-content; margin-bottom: 16px; }
  .marquee-row.fwd { animation: scrollFwd 55s linear infinite; }
  .marquee-row.rev { animation: scrollRev 55s linear infinite; }
  .marquee-row:hover { animation-play-state: paused; }
  @keyframes scrollFwd { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
  @keyframes scrollRev { from { transform: translateX(-50%); } to { transform: translateX(0); }    }
  .t-card {
    width: 310px; flex-shrink: 0; background: #fff;
    border: 1.5px solid rgba(26,60,26,0.07); border-radius: 18px; padding: 26px 24px;
    transition: border-color 0.25s ${E}, transform 0.3s ${E}, box-shadow 0.3s ${E};
  }
  .t-card:hover { border-color: rgba(200,168,75,0.4); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,60,26,0.09); }
  .t-quote { font-size: 14px; line-height: 1.75; color: #4a5a48; margin: 12px 0 20px; font-style: italic; }
  .t-author { display: flex; align-items: center; gap: 11px; }
  .t-avatar { width: 36px; height: 36px; background: #1a3c1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #c8a84b; flex-shrink: 0; }
  .t-name   { font-size: 13px; font-weight: 700; color: #1a2a18; }
  .t-detail { font-size: 11px; color: #8a9a88; margin-top: 1px; }

  /* ── Company brand logos ── */
  .lp-brands { padding: 100px 40px; }
  .brands-logo-grid {
    max-width: 1060px; margin: 52px auto 0;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  }
  .brand-logo-card {
    border-radius: 14px; padding: 22px 18px;
    display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
    transition: transform 0.22s ${E}, box-shadow 0.22s ${E};
    cursor: default; overflow: hidden; position: relative;
  }
  .brand-logo-card::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(255,255,255,0.07);
    opacity: 0; transition: opacity 0.2s ${E};
  }
  .brand-logo-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 14px 36px rgba(0,0,0,0.2); }
  .brand-logo-card:hover::after { opacity: 1; }
  .brand-logo-short {
    font-size: 22px; font-weight: 800; letter-spacing: -0.02em;
    font-family: Georgia, serif; line-height: 1;
  }
  .brand-logo-full { font-size: 11px; font-weight: 500; opacity: 0.65; letter-spacing: 0.3px; }

  /* ── Gallery ── */
  .lp-gallery { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
  .gal-cell { aspect-ratio: 1; overflow: hidden; position: relative; }
  .gal-cell img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s ${E}, filter 0.4s ${E};
    filter: brightness(0.82) saturate(0.9);
  }
  .gal-cell:hover img { transform: scale(1.09); filter: brightness(0.7) saturate(1.1); }
  .gal-label {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 20px 10px 10px;
    background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
    font-size: 12px; font-weight: 600; color: #fff;
    letter-spacing: 1.5px; text-align: center;
    opacity: 0; transform: translateY(4px);
    transition: opacity 0.3s ${E}, transform 0.3s ${E};
    text-transform: uppercase;
  }
  .gal-cell:hover .gal-label { opacity: 1; transform: none; }

  /* ── Footer ── */
  .lp-footer { background: #0f2210; padding: 80px 40px 0; border-top: 3px solid #1a3c1a; }
  .footer-wrap {
    max-width: 1060px; margin: 0 auto;
    display: grid; grid-template-columns: 1.8fr 1fr 1fr;
    gap: 52px; padding-bottom: 60px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .foot-brand-name { font-size: 15px; font-weight: 800; color: #c8a84b; letter-spacing: 2.5px; font-family: Georgia, serif; margin-top: 14px; }
  .foot-brand-sub  { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 3px; font-weight: 600; margin-top: 2px; }
  .foot-desc { font-size: 14px; color: rgba(255,255,255,0.3); line-height: 1.8; margin-top: 16px; max-width: 260px; }
  .foot-col-head   { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.28); margin-bottom: 18px; }
  .foot-col-item   { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 2; cursor: default; transition: color 0.15s; }
  .foot-col-item:hover { color: rgba(255,255,255,0.78); }
  .foot-bottom {
    max-width: 1060px; margin: 0 auto; padding: 20px 0;
    font-size: 12px; color: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── Keyframes ── */
  @keyframes riseIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .about-grid { grid-template-columns: 1fr; gap: 48px; }
    .mosaic-img:nth-child(2), .mosaic-img:nth-child(4) { margin-top: 0; }
    .products-wrap { grid-template-columns: 1fr 1fr; }
    .video-grid { grid-template-columns: 1fr 1fr; }
    .brands-logo-grid { grid-template-columns: repeat(3, 1fr); }
    .footer-wrap { grid-template-columns: 1fr 1fr; }
    .footer-wrap > :first-child { grid-column: 1 / -1; }
    .nav-links { display: none; }
    .lp-gallery { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 640px) {
    .bilingual-block { grid-template-columns: 1fr; gap: 8px; }
    .bilingual-te { border-right: none; padding-right: 0; border-bottom: 1.5px solid rgba(74,158,74,0.2); padding-bottom: 8px; }
    .bilingual-en { padding-left: 0; }
    .point-cols { grid-template-columns: 1fr; gap: 4px; }
    .point-te { border-right: none; padding-right: 0; }
  }

  @media (max-width: 768px) {
    .lp-sec, .lp-video, .lp-brands, .lp-testi { padding: 80px 24px; }
    .lp-testi { padding: 80px 0; }
    .lp-hero { padding: 90px 24px 70px; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .stat-cell:nth-child(2) { border-right: none; }
    .products-wrap { grid-template-columns: 1fr; }
    .video-grid { grid-template-columns: 1fr; max-width: 400px; }
    .brands-logo-grid { grid-template-columns: 1fr 1fr; }
    .footer-wrap { grid-template-columns: 1fr; gap: 32px; }
    .footer-wrap > :first-child { grid-column: auto; }
    .lp-footer { padding: 60px 24px 0; }
    .foot-bottom { flex-direction: column; gap: 6px; text-align: center; }
    .t-card { width: 276px; }
    .lp-gallery { grid-template-columns: repeat(2, 1fr); }
    .lp-nav-inner { padding: 0 20px; }
    .testi-header { padding: 0 24px 48px; }
  }
  @media (max-width: 480px) {
    .hero-ctas { flex-direction: column; align-items: center; }
    .cta-primary, .cta-outline { width: 100%; max-width: 280px; text-align: center; }
    .brands-logo-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  }
`

/* ─── Page ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate()
  const [raised, setRaised] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard', { replace: true })
  }, [])

  useEffect(() => {
    const onScroll = () => setRaised(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const go   = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const rowA = [...TESTIMONIALS, ...TESTIMONIALS]
  const rowB = [...TESTIMONIALS.slice(9), ...TESTIMONIALS.slice(0, 9), ...TESTIMONIALS.slice(9), ...TESTIMONIALS.slice(0, 9)]

  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        {/* ── Nav — plant logo + single Staff Sign In ── */}
        <nav className={`lp-nav${raised ? ' raised' : ''}`}>
          <div className="lp-nav-inner">
            <div className="nav-brand">
              <VSTLogoNav size={40} />
              <div className="nav-brand-text">
                <div className="nav-brand-name">VIJAYASREE</div>
                <div className="nav-brand-sub">TRADERS</div>
              </div>
            </div>
            <div className="nav-links">
              <button onClick={() => go('about')}>About</button>
              <button onClick={() => go('products')}>Products</button>
              <button onClick={() => go('reviews')}>Reviews</button>
              <button onClick={() => go('brands')}>Brands</button>
              <button onClick={() => go('contact')}>Contact</button>
            </div>
            <button className="nav-staff" onClick={() => navigate('/login')}>
              Staff Sign In <span className="arrow">→</span>
            </button>
          </div>
        </nav>

        {/* ── Hero — Telugu headline ── */}
        <section className="lp-hero" style={{ backgroundImage: `url(${heroImg})` }}>
          <div className="hero-overlay"/>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"/>
              EST. 2000 · మదనపల్లి, అన్నమయ్య జిల్లా
            </div>
            <h1 className="hero-title">
              పంట రక్షణలో నమ్మకమైన తోడు
            </h1>
            <span className="hero-sub-telugu">మన విజయ శ్రీ</span>
            <p className="hero-sub">
              Your trusted partner for quality pesticides, fertilizers and crop care solutions
              across 50+ villages in Chittoor district.
            </p>
            <div className="hero-ctas">
              <button className="cta-primary" onClick={() => go('products')}>Explore Products</button>
              <button className="cta-outline" onClick={() => go('about')}>Our Story</button>
            </div>
          </div>
          <div className="hero-scroll">
            <span>SCROLL</span>
            <div className="scroll-stem"/>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="lp-stats">
          <div className="stats-row">
            {STATS.map((s, i) => (
              <div className="stat-cell reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="stat-num"><CountUp value={s.value} suffix={s.suffix}/></div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── About ── */}
        <section className="lp-sec sec-cream" id="about">
          <div className="about-grid">
            <div className="reveal">
              <span className="eyebrow">OUR STORY</span>
              <h2 className="sec-title">రైతు సేవలో 25 సంవత్సరాలు<br/><span style={{fontSize:'0.68em',letterSpacing:'-0.01em',color:'#4a5a48'}}>A farmer's son, serving farmers.</span></h2>

              <div className="bilingual-block">
                <p className="bilingual-te">
                  రైతు కుటుంబంలో జన్మించిన యు. రామ మోహన్, రైతు నిజమైన కష్టాలను అర్థం చేసుకుంటూ పెరిగారు — నమ్మదగని ఉత్పత్తులు, పంట నష్టాలు మరియు సరైన సమయంలో నమ్మకమైన మార్గదర్శకత్వం లేకపోవడం.
                </p>
                <p className="bilingual-en">
                  Born into a farming family, U. Rama Mohan grew up understanding the real struggles of a farmer — unreliable inputs, crop losses, and the lack of trusted guidance at the right time.
                </p>
              </div>

              <div className="bilingual-block">
                <p className="bilingual-te">
                  వ్యవసాయ డిప్లొమా చేసి, మార్పు తీసుకొచ్చాలనే దృఢ సంకల్పంతో 2000 సంవత్సరంలో విజయ శ్రీ ట్రేడర్స్‌ను స్థాపించారు — <span style={{color:'#2d6a2d',fontWeight:600}}>కలిసి ఎదగడం, అత్యుత్తమ పంట రక్షణ పరిష్కారాలతో ప్రతి రైతును విజయవంతం చేయడం</span> అనే ఒకే లక్ష్యంతో.
                </p>
                <p className="bilingual-en">
                  Armed with an Agriculture diploma, he established Vijayasree Traders in 2000 — with one clear aim: <span style={{color:'#2d6a2d',fontWeight:600}}>to grow together and help every farmer succeed</span> with the best crop protection solutions available.
                </p>
              </div>

              <div className="bilingual-block">
                <p className="bilingual-te">
                  చిన్న వయసు నుండే ప్రతి సీజన్‌లో రైతుల పక్కన నడిచారు — ప్రకటనల ద్వారా కాకుండా ఫలితాల ద్వారా విశ్వాసాన్ని సంపాదించారు. పంట తర్వాత పంట, గ్రామం తర్వాత గ్రామం.
                </p>
                <p className="bilingual-en">
                  From a young age he walked alongside farmers through every season, earning their trust not through advertising but through results — crop by crop, village by village.
                </p>
              </div>

              <div className="about-points">
                {[
                  { te: 'వ్యవసాయ డిప్లొమా — విజ్ఞానంపై ఆధారపడిన మార్గదర్శకత్వం', en: 'Agriculture diploma — guidance grounded in science' },
                  { te: '2000లో ప్రారంభించి, 25+ సంవత్సరాలుగా రైతులకు సేవ', en: 'Started in 2000, serving farmers for 25+ years' },
                  { te: '12+ జాతీయ బ్రాండ్లకు అధికారిక డీలర్', en: 'Authorized dealer for 12+ national brands' },
                ].map((pt, i) => (
                  <div className="about-point" key={i}>
                    <span className="point-dot"/>
                    <div className="point-cols">
                      <div className="point-te">{pt.te}</div>
                      <div className="point-en">{pt.en}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-mosaic reveal" style={{ transitionDelay: '0.15s' }}>
              {/* Drop src/assets/shop.jpg to replace fallback */}
              <img className="mosaic-img"
                src="/src/assets/shop.jpg"
                onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=75' }}
                alt="Vijayasree Traders shop" loading="lazy"/>
<img className="mosaic-img" src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=75" alt="Tomato crop" loading="lazy"/>
              <img className="mosaic-img" src="https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&q=75" alt="Paddy field" loading="lazy"/>
            </div>
          </div>
        </section>

        {/* ── Products ── */}
        <section className="lp-sec sec-field" id="products">
          <div className="centered reveal">
            <span className="eyebrow">WHAT WE OFFER</span>
            <h2 className="sec-title">Complete crop care solutions.</h2>
            <p className="sec-body">
              Everything your farm needs — from soil preparation to harvest protection, all under one roof.
            </p>
          </div>
          <div className="products-wrap">
            {PRODUCTS.map((p, i) => (
              <div className="product-card reveal" key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="p-icon">{p.icon}</div>
                <div className="p-name">{p.name}</div>
                <div className="p-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Video Testimonials ── */}
        <section className="lp-video sec-green" id="video-reviews">
          <div className="centered reveal">
            <span className="eyebrow">VIDEO TESTIMONIALS</span>
            <h2 className="sec-title">Hear it from the farmers.</h2>
            <p className="sec-body">
              Real stories, straight from the fields — farmers sharing their experience with Vijayasree Traders.
            </p>
          </div>
          <div className="video-grid">
            {VIDEO_TESTI.map((v, i) => (
              <div className="video-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="video-thumb">
                  <img src={v.thumb} alt={v.name} loading="lazy"/>
                  <div className="video-play">
                    <div className="play-btn">▶</div>
                  </div>
                  <div className="video-duration">{v.duration}</div>
                </div>
                <div className="video-info">
                  <div className="video-farmer">{v.name}</div>
                  <div className="video-meta">{v.village} · {v.crop}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Text Testimonials marquee ── */}
        <section className="lp-testi sec-white" id="reviews">
          <div className="testi-header reveal">
            <span className="eyebrow">BUSINESS REVIEWS</span>
            <h2 className="sec-title">Trusted across generations.</h2>
            <p className="sec-body" style={{ margin: '0 auto', maxWidth: '500px' }}>
              Real experiences from the farmers who depend on us every season, year after year.
            </p>
          </div>
          <div className="marquee-clip" style={{ marginBottom: '16px' }}>
            <div className="marquee-row fwd">
              {rowA.map((t, i) => (
                <div className="t-card" key={i}>
                  <Stars n={t.stars}/>
                  <p className="t-quote">"{t.quote}"</p>
                  <div className="t-author">
                    <div className="t-avatar">{t.name[0]}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-detail">{t.village} · {t.crop}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="marquee-clip">
            <div className="marquee-row rev">
              {rowB.map((t, i) => (
                <div className="t-card" key={i}>
                  <Stars n={t.stars}/>
                  <p className="t-quote">"{t.quote}"</p>
                  <div className="t-author">
                    <div className="t-avatar">{t.name[0]}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-detail">{t.village} · {t.crop}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Company Brand Logos ── */}
        <section className="lp-brands sec-cream" id="brands">
          <div className="centered reveal">
            <span className="eyebrow">BRANDS WE CARRY</span>
            <h2 className="sec-title">Authorized dealer for India's best.</h2>
            <p className="sec-body">
              Every product on our shelves is sourced directly from these trusted manufacturers.
            </p>
          </div>
          <div className="brands-logo-grid">
            {COMPANY_BRANDS.map((b, i) => (
              <div
                className="brand-logo-card reveal"
                key={i}
                style={{ background: b.bg, color: b.text, transitionDelay: `${i * 0.04}s` }}
              >
                <div className="brand-logo-short" style={{ color: b.text }}>{b.short}</div>
                <div className="brand-logo-full"  style={{ color: b.text }}>{b.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Gallery ── */}
        <div className="lp-gallery">
          {GALLERY.map((item, i) => (
            <div className="gal-cell" key={i}>
              <img src={item.src} alt={item.label} loading="lazy"/>
              <div className="gal-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="lp-footer" id="contact">
          <div className="footer-wrap">
            <div className="reveal">
              <VSTLogo size={52}/>
              <div className="foot-brand-name">VIJAYASREE TRADERS</div>
              <div className="foot-brand-sub">PESTICIDES &amp; FERTILIZERS</div>
              <p className="foot-desc">
                A farmer's son serving farmers since 2000 — with the best crop protection solutions in Chittoor district.
              </p>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="foot-col-head">CONTACT</div>
              <div className="foot-col-item">4, VKM Complex, Santhagate</div>
              <div className="foot-col-item">Madanapalli — 517325</div>
              <div className="foot-col-item">Annamayya Dist., Andhra Pradesh</div>
              <div className="foot-col-item" style={{ marginTop: '8px' }}>📞 94407 99079</div>
              <div className="foot-col-item">GST: 37AAIPU1637K1Z8</div>
            </div>
            <div className="reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="foot-col-head">PRODUCTS</div>
              {PRODUCTS.map(p => (
                <div className="foot-col-item" key={p.name}>{p.name}</div>
              ))}
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Vijayasree Traders. All rights reserved.</span>
            <span>Madanapalli, Annamayya Dist., Andhra Pradesh</span>
          </div>
        </footer>

      </div>
    </>
  )
}
