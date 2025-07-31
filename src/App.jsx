import Chatbot from './components/Chatbot'
import MapDisplay from './components/MapDisplay'

function App() {
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
        <Chatbot />
      </div>
      <div style={mapContainerStyle}>
        <MapDisplay />
      </div>
    </div>
  )
}

export default App
