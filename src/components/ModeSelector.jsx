export default function ModeSelector({ selected, onSelect }) {
  const modes = [
    { id: 'walking', label: '🚶 Walk' },
    { id: 'bike', label: '🏍️ Bike' },
    { id: 'driving', label: '🚗 Car' },
    { id: 'transit', label: '🚌 Bus' }
  ]

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      padding: '14px',
      backgroundColor: '#0D1B2A'
    }}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          style={{
            padding: '10px 22px',
            backgroundColor: selected === mode.id
              ? '#F4A022'
              : '#1E2D3D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: selected === mode.id ? 'bold' : 'normal',
            fontSize: '14px'
          }}>
          {mode.label}
        </button>
      ))}
    </div>
  )
}