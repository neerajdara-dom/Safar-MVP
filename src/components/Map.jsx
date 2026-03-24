import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { useState, useRef, useEffect } from 'react'
import { calculateSafetyScore } from '../utils/safetyScore'
import StartNavigationPanel from '../StartNavigationPanel'
import NavigationPanel from './NavigationPanel'
import '../Map.css'
import '../StartNavigationModel.css'

const libraries = ['places', 'marker', 'geometry']
const HAVEN_TYPES = ['hospital', 'gas_station', 'car_repair', 'pharmacy']

const HAVEN_COLORS = {
  hospital: '#ef4444',
  gas_station: '#f4a022',
  car_repair: '#3b82f6',
  pharmacy: '#22c55e'
}

const HAVEN_ICONS = {
  hospital: '🏥',
  gas_station: '⛽',
  car_repair: '🔧',
  pharmacy: '💊'
}

const ROUTE_COLORS = ['#22c55e', '#f4a022', '#ef4444']

export default function Map({ mode, onRoutesFound, selectedRoute, onRouteSelect }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    version: 'weekly'
  })

  const [currentLocation, setCurrentLocation] = useState(null)
  const [destination, setDestination] = useState(null)
  const [destinationName, setDestinationName] = useState('')
  const [routes, setRoutes] = useState([])
  const [polylines, setPolylines] = useState([])
  const [status, setStatus] = useState('')
  const [safeHavens, setSafeHavens] = useState([])

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalRoute, setModalRoute] = useState(null)
  const [geminiText, setGeminiText] = useState('')
  const [geminiLoading, setGeminiLoading] = useState(false)

  // Navigation
  const [isNavigating, setIsNavigating] = useState(false)
  const [nearbyHavens, setNearbyHavens] = useState([])

  const mapRef = useRef(null)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const currentMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const havenMarkersRef = useRef([])
  const liveMarkerRef = useRef(null)
  const watchIdRef = useRef(null)

  // Sync selected route highlight with parent
  useEffect(() => {
    if (polylines.length === 0) return
    polylines.forEach((p, i) => {
      p.setOptions({
        strokeOpacity: i === selectedRoute ? 1 : 0.3,
        strokeWeight: i === selectedRoute ? 7 : 4
      })
    })
  }, [selectedRoute, polylines])

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCurrentLocation(loc)
        if (mapRef.current) {
          if (currentMarkerRef.current) currentMarkerRef.current.setMap(null)

          const el = document.createElement('div')
          el.innerHTML = `<div style="
            width:14px;height:14px;background:#4a7fe5;border-radius:50%;
            border:3px solid white;box-shadow:0 0 0 5px rgba(74,127,229,0.25);
          "></div>`

          currentMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current, position: loc, title: 'You', content: el
          })
          mapRef.current.panTo(loc)
          mapRef.current.setZoom(14)
        }
      },
      () => alert('Location access denied. Please allow location.')
    )
  }

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current, { fields: ['geometry', 'name'] }
      )
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place.geometry?.location) {
          const loc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          setDestination(loc)
          setDestinationName(place.name || '')
          if (mapRef.current) {
            if (destMarkerRef.current) destMarkerRef.current.setMap(null)

            const el = document.createElement('div')
            el.innerHTML = `<div style="
              width:20px;height:20px;background:white;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:12px;box-shadow:0 2px 12px rgba(0,0,0,0.5);
              border:2px solid #4a7fe5;
            ">📍</div>`

            destMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
              map: mapRef.current, position: loc, title: 'Destination', content: el
            })
          }
        }
      })
    }
  }, [isLoaded])

  const clearHavenMarkers = () => {
    havenMarkersRef.current.forEach(m => m.setMap(null))
    havenMarkersRef.current = []
  }

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const formatDist = (km) => km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`

  const createHavenMarker = (position, type, name) => {
    const color = HAVEN_COLORS[type] || '#8899aa'
    const icon = HAVEN_ICONS[type] || '📍'
    const el = document.createElement('div')
    el.innerHTML = `<div style="
      background:${color};border-radius:50%;width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;font-size:13px;
      border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;
    ">${icon}</div>`
    return new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current, position, title: name, content: el
    })
  }

  const fetchAndPinHavens = (route, userLocation) => {
    return new Promise((resolve) => {
      if (!mapRef.current) return resolve([])
      clearHavenMarkers()
      const path = route.overview_path
      if (!path?.length) return resolve([])
      const midPoint = path[Math.floor(path.length / 2)]
      const service = new window.google.maps.places.PlacesService(mapRef.current)
      const all = []; let done = 0

      HAVEN_TYPES.forEach((type) => {
        service.nearbySearch({ location: midPoint, radius: 2000, type }, (results, s) => {
          if (results && s === 'OK') {
            results.slice(0, 2).forEach((place) => {
              const lat = place.geometry.location.lat()
              const lng = place.geometry.location.lng()
              const dist = getDistance(userLocation.lat, userLocation.lng, lat, lng)
              const marker = createHavenMarker({ lat, lng }, type, place.name)
              havenMarkersRef.current.push(marker)
              all.push({
                name: place.name, type, lat, lng,
                distance: formatDist(dist), distanceValue: dist,
                isOpen: place.business_status === 'OPERATIONAL'
              })
            })
          }
          done++
          if (done === HAVEN_TYPES.length) {
            all.sort((a, b) => a.distanceValue - b.distanceValue)
            resolve(all)
          }
        })
      })
    })
  }

  const fetchHavenScores = (route) => {
    return new Promise((resolve) => {
      if (!mapRef.current) return resolve({ open: 0, total: 0 })
      const path = route.overview_path
      if (!path?.length) return resolve({ open: 0, total: 0 })
      const midPoint = path[Math.floor(path.length / 2)]
      const service = new window.google.maps.places.PlacesService(mapRef.current)
      let open = 0, total = 0, done = 0

      HAVEN_TYPES.forEach((type) => {
        service.nearbySearch({ location: midPoint, radius: 1500, type }, (results, s) => {
          if (results && s === 'OK') {
            total += results.length
            results.forEach(p => { if (p.business_status === 'OPERATIONAL') open++ })
          }
          done++
          if (done === HAVEN_TYPES.length) resolve({ open, total })
        })
      })
    })
  }

  const getGeminiBriefing = async (routeData, score, havensData, travelMode) => {
    setGeminiLoading(true)
    const openHavens = havensData.filter(h => h.isOpen).length
    const label = score >= 80 ? 'ELITE' : score >= 60 ? 'OPTIMAL' : 'RISK'
    const hour = new Date().getHours()
    const timeOfDay = (hour >= 19 || hour <= 6) ? 'night' : 'day'

    const prompt = `You are Safar, an AI safety assistant for night travel in India. Give a short 2-sentence safety briefing.
Route: ${routeData.legs[0].distance.text}, ${routeData.legs[0].duration.text}
Safety score: ${score}/100 (${label})
Open safe havens: ${openHavens} (hospitals, petrol pumps, mechanics, pharmacies)
Time: ${timeOfDay}, Mode: ${travelMode}
Be warm, concise, and safety-focused.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      setGeminiText(data.content?.[0]?.text || `Route scores ${score}/100. ${openHavens} safe havens are open. Stay safe!`)
    } catch {
      setGeminiText(`Your route scores ${score}/100 (${label}). ${openHavens} safe havens are open along the way. Stay alert!`)
    } finally {
      setGeminiLoading(false)
    }
  }

  const findSafeRoutes = async () => {
    if (!currentLocation) { alert('Click 📍 Use My Location first'); return }
    if (!destination) { alert('Please select a destination from the dropdown'); return }

    setStatus('Finding safe routes...')
    setRoutes([])
    setSafeHavens([])
    setShowModal(false)
    polylines.forEach(p => p.setMap(null))
    setPolylines([])
    clearHavenMarkers()

    const travelMode = mode === 'bike' ? 'DRIVING' : mode.toUpperCase()
    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route({
      origin: currentLocation,
      destination,
      travelMode: window.google.maps.TravelMode[travelMode],
      provideRouteAlternatives: true,
      drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess' }
    }, async (result, routeStatus) => {
      if (routeStatus !== 'OK') {
        setStatus('Could not find routes. Try a different destination.')
        return
      }

      setStatus('Calculating safety scores...')
      const scored = []

      for (let i = 0; i < result.routes.length; i++) {
        const route = result.routes[i]
        const havens = await fetchHavenScores(route)
        const score = calculateSafetyScore(route, havens.open, havens.total)
        scored.push({ data: route, score, havens })
      }

      scored.sort((a, b) => b.score.total - a.score.total)

      const newPolylines = scored.map((r, i) => new window.google.maps.Polyline({
        path: r.data.overview_path,
        strokeColor: ROUTE_COLORS[i] || '#8899aa',
        strokeOpacity: i === 0 ? 1 : 0.4,
        strokeWeight: i === 0 ? 7 : 4,
        map: mapRef.current
      }))

      setPolylines(newPolylines)
      setRoutes(scored)
      onRoutesFound(scored)
      onRouteSelect(0)

      setStatus('Loading safe havens...')
      const havensData = await fetchAndPinHavens(scored[0].data, currentLocation)
      setSafeHavens(havensData)
      setStatus('')

      const bounds = new window.google.maps.LatLngBounds()
      scored[0].data.overview_path.forEach(p => bounds.extend(p))
      mapRef.current.fitBounds(bounds)

      // Show modal with Gemini briefing
      setModalRoute(scored[0])
      setShowModal(true)
      setGeminiText('')
      getGeminiBriefing(scored[0].data, scored[0].score.total, havensData, mode)
    })
  }

  const startNavigation = () => {
    setShowModal(false)
    setIsNavigating(true)
    if (mapRef.current && currentLocation) {
      mapRef.current.panTo(currentLocation)
      mapRef.current.setZoom(16)
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lp = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (mapRef.current) {
          if (liveMarkerRef.current) liveMarkerRef.current.setMap(null)
          const el = document.createElement('div')
          el.innerHTML = `<div style="
            width:16px;height:16px;background:#4a7fe5;border-radius:50%;
            border:3px solid white;box-shadow:0 0 0 6px rgba(74,127,229,0.3);
          "></div>`
          liveMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current, position: lp, content: el
          })
          mapRef.current.panTo(lp)
        }
        const nearby = safeHavens
          .map(h => ({ ...h, distanceValue: getDistance(lp.lat, lp.lng, h.lat, h.lng), distance: formatDist(getDistance(lp.lat, lp.lng, h.lat, h.lng)) }))
          .filter(h => h.distanceValue <= 10)
          .sort((a, b) => a.distanceValue - b.distanceValue)
        setNearbyHavens(nearby)
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
  }

  const stopNavigation = () => {
    setIsNavigating(false)
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
    if (liveMarkerRef.current) { liveMarkerRef.current.setMap(null); liveMarkerRef.current = null }
    setNearbyHavens([])
  }

  if (!isLoaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-darkest)', color: 'var(--text-secondary)' }}>
      Loading map...
    </div>
  )

  return (
    <div className="map-container">

      {/* Search bar overlay */}
      {!isNavigating && (
        <div className="search-bar-overlay">
          <div className="search-bar">
            <div className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Where to, Safar?"
              className="search-input"
            />
            <button className="search-filter-btn" title="Options">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
              </svg>
            </button>
          </div>

          <button className="locate-btn" onClick={fetchLocation} title="Use my location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.66-6.34-2.12 2.12M8.46 15.54l-2.12 2.12m13.24 0-2.12-2.12M8.46 8.46 6.34 6.34"/>
            </svg>
          </button>

          <button className="go-btn" onClick={findSafeRoutes}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Find Safe Route
          </button>
        </div>
      )}

      {/* Status */}
      {status && (
        <div className="status-pill">
          <span className="status-spinner"></span>
          {status}
        </div>
      )}

      {/* Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={currentLocation || { lat: 17.385, lng: 78.4867 }}
        zoom={12}
        onLoad={map => mapRef.current = map}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapId: 'DEMO_MAP_ID',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0d1520' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1520' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#4a6580' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#162238' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1520' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1a2f4a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#080e1a' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e3048' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d1520' }] },
          ]
        }}
      />

      {/* Map Controls */}
      <div className="map-controls">
        <button className="map-ctrl-btn" onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 12) + 1)}>+</button>
        <button className="map-ctrl-btn" onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 12) - 1)}>−</button>
        <button className="map-ctrl-btn locate-ctrl" onClick={fetchLocation}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="12" r="8" strokeOpacity="0.4"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Start Navigation Modal */}
      {showModal && modalRoute && (
        <StartNavigationPanel
          route={modalRoute}
          destinationName={destinationName}
          geminiText={geminiText}
          geminiLoading={geminiLoading}
          safeHavens={safeHavens}
          onStart={startNavigation}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Live Navigation Panel */}
      {isNavigating && (
        <NavigationPanel
          nearbyHavens={nearbyHavens}
          onStop={stopNavigation}
        />
      )}
    </div>
  )
}