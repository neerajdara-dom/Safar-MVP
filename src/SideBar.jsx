import './Sidebar.css'

const MODES = [
  { id: 'walking', label: 'Walk', icon: '🚶' },
  { id: 'bike', label: 'Bike', icon: '🏍️' },
  { id: 'driving', label: 'Car', icon: '🚗' },
  { id: 'transit', label: 'Bus', icon: '🚌' },
]

function RouteCard({ route, index, isSelected, onSelect }) {
  const score = route.score.total
  let label, color, glow, bgAccent
  if (score >= 80) {
    label = 'ELITE'; color = '#22c55e'; glow = 'rgba(34,197,94,0.15)'; bgAccent = 'rgba(34,197,94,0.08)'
  } else if (score >= 60) {
    label = 'OPTIMAL'; color = '#f4a022'; glow = 'rgba(244,160,34,0.15)'; bgAccent = 'rgba(244,160,34,0.08)'
  } else {
    label = 'RISK'; color = '#ef4444'; glow = 'rgba(239,68,68,0.15)'; bgAccent = 'rgba(239,68,68,0.08)'
  }

  return (
    <div
      className={`route-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(index)}
      style={{
        borderColor: isSelected ? color : 'var(--border)',
        background: isSelected
          ? `linear-gradient(135deg, var(--bg-card-hover), ${bgAccent})`
          : 'var(--bg-card)',
        boxShadow: isSelected ? `0 0 20px ${glow}` : 'none'
      }}
    >
      <div className="route-card-header">
        <div className="route-label-badge" style={{ background: bgAccent, color, border: `1px solid ${color}40` }}>
          <span className="label-dot" style={{ background: color }}></span>
          {label}
        </div>
        <div className="route-score" style={{ color }}>
          {score}<span className="score-denom">/100</span>
        </div>
      </div>

      <div className="route-meta">
        <span>{route.data.legs[0].distance.text}</span>
        <span className="meta-sep">·</span>
        <span>{route.data.legs[0].duration.text}</span>
      </div>

      <div className="route-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">🛣️ Road</span>
          <div className="breakdown-bar-wrap">
            <div className="breakdown-bar" style={{ width: `${(route.score.breakdown.road / 60) * 100}%`, background: color }}></div>
          </div>
          <span className="breakdown-val">{route.score.breakdown.road}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">🏥 Havens</span>
          <div className="breakdown-bar-wrap">
            <div className="breakdown-bar" style={{ width: `${(route.score.breakdown.havens / 20) * 100}%`, background: color }}></div>
          </div>
          <span className="breakdown-val">{route.score.breakdown.havens}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">🚦 Traffic</span>
          <div className="breakdown-bar-wrap">
            <div className="breakdown-bar" style={{ width: `${(route.score.breakdown.traffic / 20) * 100}%`, background: color }}></div>
          </div>
          <span className="breakdown-val">{route.score.breakdown.traffic}</span>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ mode, onModeChange, routes, selectedRoute, onRouteSelect }) {
  return (
    <aside className="sidebar">
      {/* App branding */}
      <div className="sidebar-brand">
        <div className="brand-title">
          <span className="brand-icon">🛡️</span>
          <div>
            <div className="brand-name">Safar</div>
            <div className="brand-tagline">Safe Route Planner</div>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="sidebar-section">
        <div className="section-label">TRAVEL MODE</div>
        <div className="mode-grid">
          {MODES.map(m => (
            <button
              key={m.id}
              className={`mode-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => onModeChange(m.id)}
            >
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Routes section */}
      <div className="sidebar-section routes-section">
        <div className="section-label">
          SAFE ROUTES
          {routes.length > 0 && (
            <span className="route-count">{routes.length}</span>
          )}
        </div>

        {routes.length === 0 ? (
          <div className="empty-routes">
            <div className="empty-icon">🗺️</div>
            <div className="empty-text">Enter a destination to see safe route options</div>
          </div>
        ) : (
          <div className="routes-list">
            {routes.map((route, index) => (
              <RouteCard
                key={index}
                route={route}
                index={index}
                isSelected={index === selectedRoute}
                onSelect={onRouteSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* SOS Button at bottom */}
      <div className="sidebar-sos">
        <button
          className="sos-btn"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude, longitude } = pos.coords
              const msg = `🚨 EMERGENCY! I need help immediately.%0AMy location: https://maps.google.com/?q=${latitude},${longitude}`
              window.open(`https://wa.me/?text=${msg}`)
            }, () => {
              window.open(`https://wa.me/?text=🚨 EMERGENCY! I need help immediately. Please contact me.`)
            })
          }}
        >
          <span className="sos-pulse"></span>
          <span className="sos-star">✳</span>
          Emergency SOS
        </button>
      </div>
    </aside>
  )
}