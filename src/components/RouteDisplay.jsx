import { getRouteLabel } from '../utils/safetyScore'

export default function RouteDisplay({ routes, selectedIndex, onSelect }) {
  if (!routes || routes.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: 10,
      backgroundColor: '#0D1B2A',
      padding: '12px 16px',
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'nowrap',
      borderTop: '1px solid #1E2D3D'
    }}>
      {routes.map((route, index) => {
        const { label, color } = getRouteLabel(route.score.total)
        const isSelected = index === selectedIndex

        return (
          <div
            key={index}
            onClick={() => onSelect(index)}
            style={{
              backgroundColor: isSelected ? '#1E2D3D' : '#0D1B2A',
              border: `2px solid ${isSelected ? color : '#2A3F55'}`,
              borderRadius: '12px',
              padding: '10px 16px',
              cursor: 'pointer',
              flex: 1,
              maxWidth: '320px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* Label + Score */}
            <div style={{ textAlign: 'center', minWidth: '70px' }}>
              <div style={{
                color: color,
                fontWeight: 'bold',
                fontSize: '13px',
                marginBottom: '2px'
              }}>
                {label}
              </div>
              <div style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                lineHeight: 1
              }}>
                {route.score.total}
                <span style={{ fontSize: '12px', color: '#8899AA' }}>/100</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: '1px',
              height: '36px',
              backgroundColor: '#2A3F55'
            }} />

            {/* Distance + Duration */}
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: '13px', marginBottom: '4px' }}>
                {route.data.legs[0].distance.text} • {route.data.legs[0].duration.text}
              </div>

              {/* Score breakdown in one row */}
              <div style={{
                display: 'flex',
                gap: '10px',
                fontSize: '12px',
                color: '#8899AA'
              }}>
                <span>🛣️ Road: {route.score.breakdown.road}</span>
                <span>🏥 Havens: {route.score.breakdown.havens}</span>
                <span>🚦 Traffic: {route.score.breakdown.traffic}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}