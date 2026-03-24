export default function GeminiBriefing({ briefing, loading, onNavigate }) {
  if (!briefing && !loading) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0D1B2A',
        border: '1px solid #1E2D3D',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '480px',
        width: '100%'
      }}>
        <div style={{
          color: '#F4A022',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🤖 Gemini Safety Briefing
        </div>

        {loading ? (
          <div style={{ color: '#8899AA', fontSize: '14px' }}>
            Analyzing your route...
          </div>
        ) : (
          <>
            <p style={{
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.7',
              marginBottom: '24px'
            }}>
              {briefing}
            </p>
            <button
              onClick={onNavigate}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#22C55E',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              🧭 Start Navigation
            </button>
          </>
        )}
      </div>
    </div>
  )
}