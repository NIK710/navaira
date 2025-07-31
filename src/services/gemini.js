import { model } from '../firebase/firebase'

/**
 * Generate route preferences scoring based on user input
 * @param {string} userInput - Combined user responses about route preferences
 * @param {string} transportMode - Selected transport mode (walking, bicycling, driving)
 * @returns {Promise<Object>} - JSON object with scoring and estimated distance/duration
 */
export async function generateRoutePreferences(userInput, transportMode) {
  try {
    const prompt = `
Analyze the following user input about their ideal route preferences and return a JSON object with scores from 0 to 1 for each feature, plus estimated distance/duration.

User input: "${userInput}"
Transport mode: ${transportMode}

Return ONLY a valid JSON object in this exact format:
{
  "nature": 0.8,
  "food_cafes": 0.6,
  "quietness": 0.7,
  "scenic_views": 0.9,
  "safety": 0.8,
  "crowd_density": 0.3,
  "tourist_spots": 0.4,
  "speed_efficiency": 0.5,
  "urban_vs_green": 0.2,
  "unique_local_attractions": 0.7,
  "estimated_distance": "3 miles",
  "estimated_duration": "45 minutes"
}

Scoring guidelines:
- nature: Higher for parks, trails, natural areas
- food_cafes: Higher for food-focused routes
- quietness: Higher for peaceful, less busy areas
- scenic_views: Higher for beautiful, photogenic spots
- safety: Higher for well-lit, populated safe areas
- crowd_density: Higher score = MORE crowded (0 = very quiet, 1 = very busy)
- tourist_spots: Higher for popular attractions
- speed_efficiency: Higher for direct, fast routes
- urban_vs_green: Higher score = MORE urban (0 = very green, 1 = very urban)
- unique_local_attractions: Higher for hidden gems, local favorites

Estimate realistic distance/duration based on transport mode and preferences.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    } else {
      throw new Error('No valid JSON found in response')
    }
  } catch (error) {
    console.error('Error generating route preferences:', error)
    // Return default scoring if API fails
    return {
      nature: 0.5,
      food_cafes: 0.5,
      quietness: 0.5,
      scenic_views: 0.5,
      safety: 0.8,
      crowd_density: 0.5,
      tourist_spots: 0.5,
      speed_efficiency: 0.5,
      urban_vs_green: 0.5,
      unique_local_attractions: 0.5,
      estimated_distance: "2 miles",
      estimated_duration: "30 minutes"
    }
  }
}

/**
 * Generate chatbot responses for route planning conversation
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {string} transportMode - Selected transport mode
 * @param {string} selectedLocation - Selected starting location
 * @returns {Promise<string>} - Chatbot response
 */
export async function generateChatbotResponse(userMessage, conversationHistory = [], transportMode = 'walking', selectedLocation = 'San Francisco, CA') {
  try {
    const context = conversationHistory.map(msg => 
      `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n')
    
    const prompt = `
You are a helpful route planning assistant. Help users describe their ideal route preferences.

CONTEXT:
- Transport mode: ${transportMode}
- Starting location: ${selectedLocation}
- DO NOT ask about transport mode or starting location - these are already set
- Ask maximum 3 questions total to understand their route preferences
- Focus on preferences like: nature, food, quietness, scenic views, safety, crowds, tourist spots, etc.

Conversation history:
${context}

User's latest message: "${userMessage}"

Respond naturally and helpfully. Ask clarifying questions about their route preferences, but do not ask about transport mode or starting location since these are already configured.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chatbot response:', error)
    return "I'm sorry, I encountered an error. Could you please try again?"
  }
}