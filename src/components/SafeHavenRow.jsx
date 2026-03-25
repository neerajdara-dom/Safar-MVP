export default function SafeHavenRow({ havens }) {
  if (!havens || havens.length === 0) return null

  const getIcon = (type) => {
    if (type.includes('hospital')) return '🏥'
    if (type.includes('gas_station')) return '⛽'
    if (type.includes('car_repair')) return '🔧'
    if (type.includes('pharmacy')) return '💊'
    return '📍'
  }

  const getLabel = (type) => {
    if (type.includes('hospital')) return 'Hospital'
    if (type.includes('gas_station')) return 'Petrol Pump'
    if (type.includes('car_repair')) return 'Mechanic'
    if (type.includes('pharmacy')) return 'Medical Shop'
    return 'Safe Haven'
  }

  return (
    <div style={{
      backgroundColor: '#0A1628',
      borderTop: '1px solid #1E2D3D',
      padding: '10px 16px',
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      alignItems: 'center'
    }}>
      <span style={{
        color: '#F4A022',
        fontWeight: 'bold',
        fontSize: '12px',
        whiteSpace: 'nowrap'
      }}>
        🛡️ SAFE HAVENS
      </span>

      {havens.map((haven, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#1E2D3D',
          borderRadius: '8px',
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '14px' }}>
            {getIcon(haven.type)}
          </span>
          <div>
            <div style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>
              {getLabel(haven.type)}
            </div>
            <div style={{
              color: haven.isOpen ? '#22C55E' : '#EF4444',
              fontSize: '11px'
            }}>
              {haven.distance} • {haven.isOpen ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}