import { useState } from 'react'
import Chatbot from './components/Chatbot'
import MapDisplay from './components/MapDisplay'

function App() {
  const [transportMode, setTransportMode] = useState('walking')
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA')
  const [routePreferences, setRoutePreferences] = useState(null)

  const handleRoutePreferences = (preferences) => {
    setRoutePreferences(preferences)
    console.log('Route preferences received:', preferences)
  }
  const appStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    padding: '20px',
    gap: '20px',
    backgroundColor: '#f5f5f5',
    boxSizing: 'border-box'
  }

  const chatbotContainerStyle = {
    width: '30%',
    height: '90vh'
  }

  const mapContainerStyle = {
    width: '70%',
    height: '90vh'
  }

  return (
    <div style={appStyle}>
      <div style={chatbotContainerStyle}>
        <Chatbot 
          transportMode={transportMode}
          selectedLocation={selectedLocation}
          onRoutePreferences={handleRoutePreferences}
        />
      </div>
      <div style={mapContainerStyle}>
        <MapDisplay 
          onTransportModeChange={setTransportMode}
          onLocationChange={setSelectedLocation}
          routePreferences={routePreferences}
        />
      </div>
    </div>
  )
}

export default App
