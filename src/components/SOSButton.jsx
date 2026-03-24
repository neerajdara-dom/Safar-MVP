export default function SOSButton() {
  return (
    <button style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 999,
      backgroundColor: '#FF3B30',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '12px 20px',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(255,59,48,0.5)'
    }}>
      🆘 SOS
    </button>
  )
}