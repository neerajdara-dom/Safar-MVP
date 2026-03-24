import { useState } from 'react'
import Map from './components/Map'
import ModeSelector from './components/ModeSelector'
import SOSButton from './components/SOSButton'

function App() {
  const [mode, setMode] = useState('driving')

  return (
    <div style={{ backgroundColor: '#0D1B2A', minHeight: '100vh' }}>
      <SOSButton />
      <ModeSelector selected={mode} onSelect={setMode} />
      <Map mode={mode} />
    </div>
  )
}

export default App