export default function ProductPlaceholder({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '6px', flexShrink: 0,
      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid #b8ddb8', overflow: 'hidden'
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24"
        fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 4 16 4 9C4 6.87827 4.84285 4.84344 6.34315 3.34315C7.84344 1.84285 9.87827 1 12 1C14.1217 1 16.1566 1.84285 17.6569 3.34315C19.1571 4.84344 20 6.87827 20 9C20 16 12 22 12 22Z"
          fill="#4a9e4a" opacity="0.3"/>
        <path d="M12 8C12 8 8 5 8 3C9.5 3.5 11 5 12 8Z" fill="#2d6a2d"/>
        <path d="M12 8C12 8 16 5 16 3C14.5 3.5 13 5 12 8Z" fill="#2d6a2d"/>
        <line x1="12" y1="8" x2="12" y2="18"
          stroke="#2d6a2d" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 13C12 13 9 11 8 9C9.5 9 11 11 12 13Z" fill="#4a9e4a"/>
        <path d="M12 13C12 13 15 11 16 9C14.5 9 13 11 12 13Z" fill="#4a9e4a"/>
      </svg>
    </div>
  )
}