// This file will handle interactions with the Gemini API

const MODEL_NAME = 'gemini-2.0-flash'; // As requested by the user
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

let apiKey = localStorage.getItem('geminiApiKey');

export function setApiKey(key) {
    apiKey = key;
    localStorage.setItem('geminiApiKey', key);
    console.log("API Key set and saved to localStorage.");
}

export function getApiKey() {
    if (!apiKey) {
        apiKey = localStorage.getItem('geminiApiKey'); // Ensure it's loaded if not already
    }
    return apiKey;
}

export async function getAdviceResponse(characterPersonaPrompt, characterProblem, userAdvice) {
    const currentApiKey = getApiKey(); // Make sure we have the latest from localStorage
    if (!currentApiKey) {
        console.error("Gemini API Key not set. Please set it in the settings.");
        return "Error: Gemini API Key not set. Please go to settings to add your key.";
    }

    // Combine the character's persona prompt with the specific situation and advice.
    const fullPrompt = `${characterPersonaPrompt}

The character is currently facing this specific problem: "${characterProblem}"

The user has given the following advice: "${userAdvice}"

Based on all of the above (especially the character's persona defined in the first part), describe what happens next as a direct, interesting, and concise consequence. The consequence should be a short, engaging paragraph, fitting the character's way of thinking and speaking.`;

    console.log(`Sending to Gemini (${MODEL_NAME}) for character problem: ${characterProblem}, User Advice: ${userAdvice}`);
    // console.log("Full prompt being sent:", fullPrompt); // Uncomment for debugging prompts
    
    const requestBody = {
        contents: [
            {
                parts: [{ text: fullPrompt }]
            }
        ],
        generationConfig: {
            temperature: 0.75, // Slightly increased for more varied character voices
            maxOutputTokens: 200, // Increased slightly for potentially more descriptive character reactions
            topP: 0.9,
            topK: 40
            // Consider adding stop sequences here if characters have common catchphrases for ending thoughts.
            // stopSequences: ["And that's that."] 
        }
    };

    const apiUrl = `${GEMINI_API_BASE_URL}${MODEL_NAME}:generateContent?key=${currentApiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
            console.error("Gemini API Error Response:", errorData);
            let errorMessage = `API request failed with status ${response.status}.`;
            if (errorData.error && errorData.error.message) {
                errorMessage += ` Message: ${errorData.error.message}`;
            }
            // Check for common API key issues
            if (response.status === 400 && errorData.error?.message?.toLowerCase().includes("api key not valid")){
                errorMessage = "Error: The Gemini API Key is not valid. Please check it in Settings.";
            } else if (response.status === 403){
                 errorMessage = "Error: API Key valid, but permission denied. Ensure the Gemini API is enabled for your project/key.";
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Gemini API Full Response:", data);

        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            const consequence = data.candidates[0].content.parts[0].text;
            console.log(`Gemini Processed Consequence: ${consequence}`);
            return consequence.trim();
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
            console.warn("Gemini API: Prompt blocked", data.promptFeedback);
            let reason = data.promptFeedback.blockReason;
            if(data.promptFeedback.safetyRatings && data.promptFeedback.safetyRatings.length > 0) {
                reason += ` (Category: ${data.promptFeedback.safetyRatings[0].category})`;
            }
            return `The character (or maybe your advice) was a bit too much for the AI storyteller (blocked: ${reason}). Try a different approach!`;
        } else {
            console.warn("Gemini API: Unexpected response structure", data);
            return "The AI storyteller got tongue-tied. Maybe try that advice again?";
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `(API Call Failed: ${error.message}) The oracle is silent for now. Try again shortly. (This is a fallback error response)`;
    }
}

// These functions are not directly used by getAdviceResponse for the primary game loop with Gemini 2.0 Flash,
// but can be useful for more complex scenarios or if you want Gemini to generate the character prompts themselves.
export function constructCharacterPrompt(characterDetails, situation) {
    return `You are ${characterDetails.name}, ${characterDetails.description}. You are currently facing a situation: "${situation}". You need to ask the user for advice. What do you say in a single, engaging question?`;
}

export function constructConsequencePrompt(characterDetails, situation, adviceGiven, outcome) {
    return `Character ${characterDetails.name} was in a situation: "${situation}". They were given the advice: "${adviceGiven}". Because of this, ${outcome} happened. Describe the current state of ${characterDetails.name} and what happens next in a narrative style.`;
} 