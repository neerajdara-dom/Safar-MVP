import './StartNavigationModel.css'

const HAVEN_ICONS = {
  hospital: '🏥',
  gas_station: '⛽',
  car_repair: '🔧',
  pharmacy: '💊'
}

const HAVEN_LABELS = {
  hospital: 'Hospital',
  gas_station: 'Petrol Pump',
  car_repair: 'Mechanic',
  pharmacy: 'Medical Shop'
}

export default function StartNavigationModal({
  route, destinationName, geminiText, geminiLoading, safeHavens, onStart, onClose
}) {
  const score = route.score.total
  let label, color, glow
  if (score >= 80) { label = 'ELITE'; color = '#22c55e'; glow = 'rgba(34,197,94,0.25)' }
  else if (score >= 60) { label = 'OPTIMAL'; color = '#f4a022'; glow = 'rgba(244,160,34,0.25)' }
  else { label = 'RISK'; color = '#ef4444'; glow = 'rgba(239,68,68,0.25)' }

  const openHavens = safeHavens.filter(h => h.isOpen)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-eyebrow">ACTIVE NOCTURNE ROUTE</div>
            <div className="modal-title">{destinationName || 'Destination'}</div>
            <div className="modal-subtitle">
              {route.data.legs[0].distance.text} · {route.data.legs[0].duration.text}
            </div>
          </div>
          <div className="modal-badge" style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
            <span className="badge-dot" style={{ background: color }}></span>
            {label}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Score Stats */}
        <div className="modal-stats">
          <div className="stat-box">
            <div className="stat-label">DISTANCE</div>
            <div className="stat-value">{route.data.legs[0].distance.text.replace(' km', '')}<span className="stat-unit"> km</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-label">EST. TIME</div>
            <div className="stat-value">{route.data.legs[0].duration.text.replace(' mins', '').replace(' min', '')}<span className="stat-unit"> min</span></div>
          </div>
          <div className="stat-box">
            <div className="stat-label">SAFETY</div>
            <div className="stat-value" style={{ color }}>{score}<span className="stat-unit">/100</span></div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="modal-breakdown">
          <div className="breakdown-row">
            <div className="breakdown-icon-wrap" style={{ background: 'rgba(74,127,229,0.15)' }}>🛣️</div>
            <div className="breakdown-info">
              <div className="breakdown-name">Road Quality</div>
              <div className="breakdown-sub">Highway / Urban / Isolated scoring</div>
            </div>
            <span className="breakdown-check" style={{ color }}>✓</span>
          </div>
          <div className="breakdown-row">
            <div className="breakdown-icon-wrap" style={{ background: 'rgba(244,160,34,0.15)' }}>🛡️</div>
            <div className="breakdown-info">
              <div className="breakdown-name">Safe Havens</div>
              <div className="breakdown-sub">{safeHavens.length} locations found along route</div>
            </div>
            <span className="breakdown-check" style={{ color }}>✓</span>
          </div>
        </div>

        {/* Gemini Briefing */}
        <div className="modal-gemini">
          <div className="gemini-label">
            <span>🤖</span> AI Safety Briefing
          </div>
          {geminiLoading ? (
            <div className="gemini-loading">
              <span className="gemini-spinner"></span>
              <span>Analyzing your route...</span>
            </div>
          ) : (
            <p className="gemini-text">{geminiText}</p>
          )}
        </div>

        {/* Safe havens row */}
        {safeHavens.length > 0 && (
          <div className="modal-havens">
            {safeHavens.slice(0, 5).map((h, i) => (
              <div key={i} className="haven-chip" style={{ borderColor: h.isOpen ? '#22c55e40' : '#ef444440' }}>
                <span>{HAVEN_ICONS[h.type] || '📍'}</span>
                <div>
                  <div className="haven-chip-name">{HAVEN_LABELS[h.type] || h.type}</div>
                  <div className="haven-chip-dist" style={{ color: h.isOpen ? '#22c55e' : '#ef4444' }}>
                    {h.distance} · {h.isOpen ? 'Open' : 'Closed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-start-btn" onClick={onStart} style={{ boxShadow: `0 6px 24px ${glow}` }}>
            🧭 Start Navigation
          </button>
          <button className="modal-dismiss-btn" onClick={onClose}>
            View Routes Only
          </button>
        </div>
      </div>
    </div>
  )
}