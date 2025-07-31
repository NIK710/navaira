import { useState, useEffect } from 'react'
import { generateChatbotResponse, generateRoutePreferences } from '../services/gemini'
import ReactMarkdown from "react-markdown";

function Chatbot({ transportMode, selectedLocation, onRoutePreferences }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationStage, setConversationStage] = useState('welcome') // welcome, gathering, complete
  const [userResponses, setUserResponses] = useState([])
  const [routePreferences, setRoutePreferences] = useState(null)

  // Welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      type: 'bot',
      text: "Hi! I'm here to help you build a route for the perfect walk, bike, or drive. Tell me what kind of places or experiences you want to include — nature, food, quiet paths, scenic views, etc."
    }
    setMessages([welcomeMessage])
  }, [])

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return

    const userMessage = { type: 'user', text: inputText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    
    // Store user response
    const newUserResponses = [...userResponses, inputText]
    setUserResponses(newUserResponses)
    
    setInputText('')
    setLoading(true)

    try {
      let botResponse
      
      // Determine conversation flow
      if (conversationStage === 'welcome' || conversationStage === 'gathering') {
        // Check if we have enough information (3+ responses or distance mentioned)
        const hasDistanceInfo = newUserResponses.some(response => 
          /\b(\d+\s*(miles?|mi|km|kilometers?|minutes?|min|hours?|hr))\b/i.test(response)
        )
        
        if (newUserResponses.length >= 3 || (newUserResponses.length >= 2 && hasDistanceInfo)) {
          // Generate final preferences
          setConversationStage('complete')
          const combinedInput = newUserResponses.join(' ')
          
          // Generate route preferences using Gemini
          const preferences = await generateRoutePreferences(combinedInput, transportMode)
          setRoutePreferences(preferences)
          
          // Notify parent component
          if (onRoutePreferences) {
            onRoutePreferences(preferences)
          }
          
          botResponse = `Perfect! I've analyzed your preferences and created a route profile. Your personalized ${transportMode} route is ready to be generated!`
        } else {
          // Generate follow-up questions
          setConversationStage('gathering')
          
          // Ask specific follow-up questions based on what's missing
          let followUpPrompt = inputText
          if (newUserResponses.length === 1) {
            followUpPrompt += " Now, could you tell me more about your preferences? For example, do you prefer busy areas with lots to see, or quieter, more peaceful routes?"
          } else if (newUserResponses.length === 2 && !hasDistanceInfo) {
            followUpPrompt += " How far or how long do you want this trip to be? For example, a quick 15-minute walk, a 2-hour bike ride, or something else?"
          }
          
          botResponse = await generateChatbotResponse(followUpPrompt, newMessages, transportMode, selectedLocation)
        }
      } else {
        // Conversation complete, just respond normally
        botResponse = await generateChatbotResponse(inputText, newMessages, transportMode, selectedLocation)
      }
      
      const botMessage = { type: 'bot', text: botResponse }
      setMessages(prev => [...prev, botMessage])
      
    } catch (err) {
      console.error('Error in chatbot conversation:', err)
      const errorMessage = { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Could you please try again?' 
      }
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box'
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