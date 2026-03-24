// NavigationPanel.jsx
export function NavigationPanel({ nearbyHavens, onStop }) {
  const ICONS = { hospital: '🏥', gas_station: '⛽', car_repair: '🔧', pharmacy: '💊' }
  const LABELS = { hospital: 'Hospital', gas_station: 'Petrol Pump', car_repair: 'Mechanic', pharmacy: 'Medical Shop' }

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      background: 'rgba(13,21,32,0.95)',
      borderTop: '2px solid #22c55e',
      zIndex: 100,
      padding: '14px 16px',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s ease infinite' }}></span>
          LIVE NAVIGATION
        </div>
        <button onClick={onStop} style={{
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          color: '#ef4444', borderRadius: '8px', padding: '5px 12px',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer'
        }}>✕ Stop</button>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-muted, #4a6580)', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>
        Safe Stops Within 10 km
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {nearbyHavens.length === 0 ? (
          <div style={{ color: '#4a6580', fontSize: '12px' }}>No safe havens detected nearby</div>
        ) : nearbyHavens.map((h, i) => (
          <div key={i} style={{
            background: '#111c2d', border: '1px solid #1e3048', borderRadius: '10px',
            padding: '8px 12px', whiteSpace: 'nowrap', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '7px'
          }}>
            <span style={{ fontSize: '16px' }}>{ICONS[h.type] || '📍'}</span>
            <div>
              <div style={{ color: '#e8f0fe', fontSize: '12px', fontWeight: 500 }}>{LABELS[h.type] || h.type}</div>
              <div style={{ fontSize: '10px', color: h.isOpen ? '#22c55e' : '#ef4444', marginTop: 1 }}>
                {h.distance} · {h.isOpen ? 'Open' : 'Closed'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NavigationPanel