import { useState } from 'react'
import { model } from './firebase/firebase'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return

    const userMessage = { type: 'user', text: inputText }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setLoading(true)

    try {
      const result = await model.generateContent(inputText)
      const response = await result.response
      const text = response.text()
      const botMessage = { type: 'bot', text: text }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      console.error('Error generating text:', err)
      const errorMessage = { type: 'bot', text: 'Sorry, I encountered an error. Please check your Firebase configuration.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.text}
          </div>
        ))}
        {loading && (
          <div className="message bot loading-message">
            Thinking...
          </div>
        )}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !inputText.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App
