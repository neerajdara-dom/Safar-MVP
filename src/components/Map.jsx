import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { useState, useRef, useEffect } from 'react'
import RouteDisplay from './RouteDisplay'
import { calculateSafetyScore } from '../utils/safetyScore'

const libraries = ['places', 'marker', 'geometry']

const mapContainerStyle = {
  width: '100%',
  height: '85vh'
}

export default function Map({ mode }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    version: 'weekly'
  })

  const [currentLocation, setCurrentLocation] = useState(null)
  const [destination, setDestination] = useState(null)
  const [routes, setRoutes] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(0)
  const [polylines, setPolylines] = useState([])
  const [status, setStatus] = useState('')

  const mapRef = useRef(null)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const currentMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(loc)

        // Add marker for current location
        if (mapRef.current) {
          if (currentMarkerRef.current) {
            currentMarkerRef.current.setMap(null)
          }
          currentMarkerRef.current =
            new window.google.maps.marker.AdvancedMarkerElement({
              map: mapRef.current,
              position: loc,
              title: 'You are here'
            })
          mapRef.current.panTo(loc)
          mapRef.current.setZoom(14)
        }
      },
      (err) => {
        alert('Location access denied. Please allow location access.')
      }
    )
  }

  // Setup autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { fields: ['geometry', 'name'] }
      )
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place.geometry?.location) {
          const loc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
          setDestination(loc)

          // Add destination marker
          if (mapRef.current) {
            if (destMarkerRef.current) {
              destMarkerRef.current.setMap(null)
            }
            destMarkerRef.current =
              new window.google.maps.marker.AdvancedMarkerElement({
                map: mapRef.current,
                position: loc,
                title: 'Destination'
              })
          }
        }
      })
    }
  }, [isLoaded])

  // Fetch safe havens near midpoint of route
  const fetchSafeHavens = (route) => {
    return new Promise((resolve) => {
      if (!mapRef.current) return resolve({ open: 0, total: 0 })

      const path = route.overview_path
      if (!path || path.length === 0) return resolve({ open: 0, total: 0 })

      const midPoint = path[Math.floor(path.length / 2)]
      const service = new window.google.maps.places.PlacesService(mapRef.current)

      let open = 0
      let total = 0
      let completed = 0
      const types = ['hospital', 'gas_station', 'car_repair', 'pharmacy']

      types.forEach((type) => {
        service.nearbySearch(
          { location: midPoint, radius: 1500, type },
          (results, status) => {
            if (results && status === 'OK') {
              total += results.length
              results.forEach((place) => {
                if (place.business_status === 'OPERATIONAL') open++
              })
            }
            completed++
            if (completed === types.length) resolve({ open, total })
          }
        )
      })
    })
  }

  // Main routing function
  const findSafeRoutes = async () => {
    if (!currentLocation) {
      alert('Please click 📍 My Location first')
      return
    }
    if (!destination) {
      alert('Please enter and select a destination')
      return
    }

    setStatus('Finding safe routes...')
    setRoutes([])

    // Clear old polylines
    polylines.forEach((p) => p.setMap(null))
    setPolylines([])

    const travelMode =
      mode === 'bike' ? 'DRIVING' : mode.toUpperCase()

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        provideRouteAlternatives: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess'
        }
      },
      async (result, status) => {
        if (status !== 'OK') {
          setStatus('Could not find routes. Try a different destination.')
          return
        }
        console.log('FULL STEP:', JSON.stringify(result.routes[0].legs[0].steps[0]))


        setStatus('Calculating safety scores...')
        const scoredRoutes = []

        for (let i = 0; i < result.routes.length; i++) {
          const route = result.routes[i]
          const havens = await fetchSafeHavens(route)
          const score = calculateSafetyScore(route, havens.open, havens.total)
          scoredRoutes.push({ data: route, score, havens })
        }

        // Sort safest first
        scoredRoutes.sort((a, b) => b.score.total - a.score.total)

        // Draw routes
        const newPolylines = scoredRoutes.map((route, index) => {
          const color =
            index === 0 ? '#22C55E' : index === 1 ? '#F4A022' : '#EF4444'
          return new window.google.maps.Polyline({
            path: route.data.overview_path,
            strokeColor: color,
            strokeOpacity: index === 0 ? 1 : 0.5,
            strokeWeight: index === 0 ? 6 : 4,
            map: mapRef.current
          })
        })

        setPolylines(newPolylines)
        setRoutes(scoredRoutes)
        setSelectedRoute(0)
        setStatus('')

        // Fit bounds
        const bounds = new window.google.maps.LatLngBounds()
        scoredRoutes[0].data.overview_path.forEach((p) => bounds.extend(p))
        mapRef.current.fitBounds(bounds)
      }
    )
  }

  const handleRouteSelect = (index) => {
    setSelectedRoute(index)
    polylines.forEach((p, i) => {
      p.setOptions({
        strokeOpacity: i === index ? 1 : 0.3,
        strokeWeight: i === index ? 6 : 3
      })
    })
  }

  if (!isLoaded) return (
    <div style={{ color: 'white', padding: '20px' }}>Loading Map...</div>
  )

  return (
    <div style={{ position: 'relative' }}>

      {/* Search Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button onClick={fetchLocation} style={{
          padding: '10px 16px',
          backgroundColor: '#F4A022',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          📍 My Location
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Enter destination..."
          style={{
            padding: '10px 16px',
            width: '240px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '15px'
          }}
        />

        <button onClick={findSafeRoutes} style={{
          padding: '10px 16px',
          backgroundColor: '#22C55E',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: 'white'
        }}>
          🛡️ Find Safe Route
        </button>
      </div>

      {/* Status message */}
      {status !== '' && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          backgroundColor: '#0D1B2A',
          color: '#F4A022',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation || { lat: 17.385, lng: 78.4867 }}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapId: 'DEMO_MAP_ID'
        }}
      />

      {/* Route Cards */}
      <RouteDisplay
        routes={routes}
        selectedIndex={selectedRoute}
        onSelect={handleRouteSelect}
      />
    </div>
  )
}