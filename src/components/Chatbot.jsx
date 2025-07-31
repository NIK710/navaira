import { useState } from 'react'
import { model } from '../firebase/firebase'
import ReactMarkdown from "react-markdown";




function Chatbot() {
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

  const chatbotStyle = {
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '20px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif'
  }

  const chatBoxStyle = {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '8px'
  }

  const messageStyle = {
    marginBottom: '15px',
    lineHeight: '1.4'
  }

  const userMessageStyle = {
    ...messageStyle,
    textAlign: 'right',
    color: '#0066cc'
  }

  const botMessageStyle = {
    ...messageStyle,
    textAlign: 'left',
    color: '#333'
  }

  const inputContainerStyle = {
    display: 'flex',
    gap: '10px'
  }

  const inputStyle = {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px'
  }

  const buttonStyle = {
    padding: '10px 20px',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#ccc',
    cursor: 'not-allowed'
  }

  return (
    <div style={chatbotStyle}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>AI Chatbot</h3>
      <div style={chatBoxStyle}>
        {messages.map((message, index) => (
          <div key={index} style={message.type === 'user' ? userMessageStyle : botMessageStyle}>
            {message.type === 'bot' ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
        {loading && (
          <div style={{ ...botMessageStyle, fontStyle: 'italic', color: '#666' }}>
            Thinking...
          </div>
        )}
      </div>
      
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          style={inputStyle}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !inputText.trim()}
          style={loading || !inputText.trim() ? disabledButtonStyle : buttonStyle}
        >
          Send
        </button>
      </div>
    </div>
  )
}



export default Chatbot