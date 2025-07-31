function MapDisplay() {
  const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY

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

  const iframeStyle = {
    flex: 1,
    border: 'none',
    borderRadius: '8px',
    marginTop: '15px'
  }

  const mapUrl = MAPS_API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=San+Francisco,CA`
    : null

  return (
    <div style={mapContainerStyle}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Map Display</h3>
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
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          Please set VITE_MAPS_API_KEY in your .env file to display the map
        </div>
      )}
    </div>
  )
}

export default MapDisplay