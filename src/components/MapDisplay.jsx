import { useState, useEffect, useRef } from 'react'

// Global flag to prevent multiple script loads
let isGoogleMapsLoading = false
let isGoogleMapsLoaded = false

function MapDisplay({ onTransportModeChange, onLocationChange, routePreferences }) {
  const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA')
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [transportMode, setTransportMode] = useState('walking') // Default to walk
  const autocompleteService = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    if (!MAPS_API_KEY) return

    const initializeAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          autocompleteService.current = new window.google.maps.places.AutocompleteService()
          isGoogleMapsLoaded = true
        } catch (error) {
          console.error('Error initializing Google Maps Autocomplete:', error)
        }
      }
    }

    // Check if already loaded
    if (isGoogleMapsLoaded || (window.google && window.google.maps && window.google.maps.places)) {
      initializeAutocomplete()
      return
    }

    // Check if already loading
    if (isGoogleMapsLoading) {
      // Wait for the loading to complete
      const checkLoaded = setInterval(() => {
        if (isGoogleMapsLoaded || (window.google && window.google.maps && window.google.maps.places)) {
          clearInterval(checkLoaded)
          initializeAutocomplete()
        }
      }, 100)
      return () => clearInterval(checkLoaded)
    }

    // Load the script
    isGoogleMapsLoading = true
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.onload = () => {
      isGoogleMapsLoading = false
      initializeAutocomplete()
    }
    script.onerror = () => {
      isGoogleMapsLoading = false
      console.error('Failed to load Google Maps script')
    }
    
    document.head.appendChild(script)

    return () => {
      // Don't remove the script as it might be used by other components
      // Just clean up our references
      if (autocompleteService.current) {
        autocompleteService.current = null
      }
    }
  }, [MAPS_API_KEY])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      if (value && autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            types: ['geocode']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions.slice(0, 5))
              setShowSuggestions(true)
            } else {
              setSuggestions([])
              setShowSuggestions(false)
            }
          }
        )
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }

  const handleSuggestionClick = (suggestion) => {
    setSelectedLocation(suggestion.description)
    setInputValue(suggestion.description)
    setShowSuggestions(false)
    setSuggestions([])
    // Notify parent component
    if (onLocationChange) {
      onLocationChange(suggestion.description)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue) {
      setSelectedLocation(inputValue)
      setShowSuggestions(false)
      setSuggestions([])
      // Notify parent component
      if (onLocationChange) {
        onLocationChange(inputValue)
      }
    }
  }

  const handleTransportModeChange = (mode) => {
    setTransportMode(mode)
    // Notify parent component
    if (onTransportModeChange) {
      onTransportModeChange(mode)
    }
  }

  const mapContainerStyle = {
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
  }

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '20px',
    width: '100%'
  }

  const inputRowStyle = {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start'
  }

  const inputFieldContainerStyle = {
    position: 'relative',
    flex: '1'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box'
  }

  const modeButtonsStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }

  const modeButtonStyle = {
    padding: '10px 16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }

  const activeModeButtonStyle = {
    ...modeButtonStyle,
    backgroundColor: '#0066cc',
    color: 'white',
    borderColor: '#0066cc'
  }

  const suggestionsStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #ccc',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000
  }

  const suggestionStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
  }

  const suggestionHoverStyle = {
    backgroundColor: '#f5f5f5'
  }

  const iframeStyle = {
    flex: 1,
    border: 'none',
    borderRadius: '8px'
  }

  const mapUrl = MAPS_API_KEY && selectedLocation
    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(selectedLocation)}`
    : null

  return (
    <div style={mapContainerStyle}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Map Display</h3>
      
      <div style={inputContainerStyle}>
        <div style={inputRowStyle}>
          <div style={inputFieldContainerStyle}>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter starting location..."
              style={inputStyle}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={suggestionsStyle}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.place_id}
                    style={suggestionStyle}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f5f5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white'
                    }}
                  >
                    {suggestion.description}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={modeButtonsStyle}>
            <button
              style={transportMode === 'driving' ? activeModeButtonStyle : modeButtonStyle}
              onClick={() => setTransportMode('driving')}
            >
              Car
            </button>
            <button
              style={transportMode === 'bicycling' ? activeModeButtonStyle : modeButtonStyle}
              onClick={() => setTransportMode('bicycling')}
            >
              Bike
            </button>
            <button
              style={transportMode === 'walking' ? activeModeButtonStyle : modeButtonStyle}
              onClick={() => setTransportMode('walking')}
            >
              Walk
            </button>
          </div>
        </div>
      </div>

      {mapUrl ? (
        <iframe
          style={iframeStyle}
          src={mapUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps"
        ></iframe>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontStyle: 'italic',
          border: '1px solid #eee',
          borderRadius: '8px'
        }}>
          {!MAPS_API_KEY ? null : 'Loading map...'}
        </div>
      )}
    </div>
  )
}

export default MapDisplay