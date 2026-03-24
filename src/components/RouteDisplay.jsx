import { getRouteLabel } from '../utils/safetyScore'

export default function RouteDisplay({ routes, selectedIndex, onSelect }) {
  if (!routes || routes.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'center'
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
              padding: '12px 18px',
              cursor: 'pointer',
              minWidth: '140px',
              textAlign: 'center'
            }}
          >
            <div style={{
              color: color,
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '4px'
            }}>
              {label}
            </div>

            <div style={{
              color: 'white',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              {route.score.total}/100
            </div>

            <div style={{
              color: '#8899AA',
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              {route.data.legs[0].distance.text} •{' '}
              {route.data.legs[0].duration.text}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#8899AA'
            }}>
              <span>🛣️ {route.score.breakdown.road}</span>
              <span>🏥 {route.score.breakdown.havens}</span>
              <span>🚦 {route.score.breakdown.traffic}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}