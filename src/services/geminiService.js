// This file will handle interactions with the Gemini API

const GEMINI_API_ENDPOINT = 'YOUR_GEMINI_API_ENDPOINT_HERE'; // Replace with actual endpoint
let apiKey = localStorage.getItem('geminiApiKey');

export function setApiKey(key) {
    apiKey = key;
    localStorage.setItem('geminiApiKey', key);
    console.log("API Key set and saved to localStorage.");
}

export function getApiKey() {
    return apiKey;
}

export async function getAdviceResponse(characterPrompt, userAdvice) {
    if (!apiKey) {
        console.error("Gemini API Key not set. Please set it in the settings.");
        return "Error: Gemini API Key not set. Please go to settings to add your key.";
    }

    console.log(`Sending to Gemini: Character Prompt - ${characterPrompt}, User Advice - ${userAdvice}`);
    
    // Placeholder for actual Gemini API call structure
    // You'll need to consult the Gemini API documentation for the correct request body and headers.
    const requestBody = {
        // This structure is hypothetical and depends on the Gemini API
        // It might look something like this:
        // contents: [
        //     { parts: [{ text: `Character context: ${characterPrompt}` }] },
        //     { parts: [{ text: `User advice: ${userAdvice}` }] },
        //     { parts: [{ text: "Based on the context and advice, what is the most likely and interesting consequence?"}] }
        // ],
        // generationConfig: {
        //   temperature: 0.7, // Example config
        //   topK: 1,
        //   topP: 1,
        //   maxOutputTokens: 256,
        // }
        prompt: `Character situation: ${characterPrompt}\nUser gives this advice: "${userAdvice}"\nWhat happens next as a direct and interesting consequence? Be creative. Respond with only the consequence.`
    };

    try {
        // IMPORTANT: Replace with the actual Gemini API endpoint and request structure.
        // The endpoint might look like: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        // This is a HYPOTHETICAL endpoint.
        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => response.text());
            console.error("Gemini API Error:", response.status, errorData);
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // IMPORTANT: The way you extract the text will depend on the actual Gemini API response structure.
        // It might be data.candidates[0].content.parts[0].text or similar.
        const consequence = data.generated_text || data.candidates?.[0]?.content?.parts?.[0]?.text || "The AI responded, but I couldn't understand the format."; 
        console.log("Gemini raw response:", data);
        console.log(`Gemini processed consequence: ${consequence}`);
        return consequence;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback to simulated response if API call fails for now
        return `(API Error: ${error.message}) Oh no! The character followed your advice about \"${userAdvice}\" and things went terribly wrong. They are now in a worse situation than before. (This is a fallback error response)`;
    }
}

// Example of how you might structure a more complex prompt for Gemini
export function constructCharacterPrompt(characterDetails, situation) {
    return `You are ${characterDetails.name}, ${characterDetails.description}. You are currently facing a situation: "${situation}". You need to ask the user for advice. What do you say?`;
}

export function constructConsequencePrompt(characterDetails, situation, adviceGiven, outcome) {
    return `Character ${characterDetails.name} was in a situation: "${situation}". They were given the advice: "${adviceGiven}". Because of this, ${outcome} happened. Describe the current state of ${characterDetails.name} and what happens next.`;
} 