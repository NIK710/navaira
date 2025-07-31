import { useState, useEffect, useRef } from 'react'

function MapDisplay() {
  const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY
  const [selectedLocation, setSelectedLocation] = useState('San Francisco, CA')
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteService = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    if (MAPS_API_KEY && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
  }, [MAPS_API_KEY])

  useEffect(() => {
    if (!MAPS_API_KEY) return

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = () => {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
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
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue) {
      setSelectedLocation(inputValue)
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const mapContainerStyle = {
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '20px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif'
  }

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '15px'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
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