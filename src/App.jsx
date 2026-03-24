import { useState } from 'react'
import Map from './components/Map'
import SOSButton from './components/SOSButton'
import Sidebar from './SideBar'
import TopNav from './TopNav'
import AboutModal from './AboutModal'
import EmergencyContactsModal from './EmergencyContactModal'
import './App.css'

function App() {
  const [mode, setMode] = useState('driving')
  const [activePage, setActivePage] = useState('dashboard')
  const [showAbout, setShowAbout] = useState(false)
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false)
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(0)

  return (
    <div className="app-root">
      {/* Top Navigation */}
      <TopNav
        onAbout={() => setShowAbout(true)}
        onEmergencyContacts={() => setShowEmergencyContacts(true)}
      />

      <div className="app-body">
        {/* Left Sidebar */}
        <Sidebar
          mode={mode}
          onModeChange={setMode}
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteSelect={setSelectedRoute}
        />

        {/* Map takes remaining space */}
        <div className="map-area">
          <Map
            mode={mode}
            onRoutesFound={setRoutes}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
          />
        </div>
      </div>

      {/* Modals */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showEmergencyContacts && (
        <EmergencyContactsModal onClose={() => setShowEmergencyContacts(false)} />
      )}
    </div>
  )
}

export default App