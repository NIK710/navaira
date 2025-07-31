import Chatbot from './components/Chatbot'
import MapDisplay from './components/MapDisplay'

function App() {
  const appStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    gap: '30px',
    backgroundColor: '#f5f5f5'
  }

  const componentStyle = {
    flex: 1,
    maxWidth: '500px'
  }

  return (
    <div style={appStyle}>
      <div style={componentStyle}>
        <Chatbot />
      </div>
      <div style={componentStyle}>
        <MapDisplay />
      </div>
    </div>
  )
}

export default App
