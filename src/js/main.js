import { getAdviceResponse, getApiKey } from '../services/geminiService.js';

console.log('Advice Simulator loaded!');

// Check for API key on load and prompt if not set
if (!getApiKey()) {
    alert("Gemini API Key not found. Please go to Settings to add your key for the game to work correctly with AI.");
}

// Sample Character Data
const characters = {
    character1: {
        name: "Nervous Nick",
        description: "A very anxious person who overthinks everything.",
        image: "src/assets/nick.png", // We'll need to add an image later
        scenarios: [
            {
                id: "s1",
                problem: "I have a big presentation tomorrow and I'm terrified I'll mess it up! What should I do?",
                // adviceOptions are no longer used for direct buttons, but could be for hints or AI priming
            }
            // ... more scenarios for Nick
        ]
    }
    // ... more characters
};

// Basic game state
let currentCharacterId = null;
let currentScenarioId = null;

// DOM Elements
const characterArea = document.getElementById('character-area');
const dialogArea = document.getElementById('dialog-area');
const responseArea = document.getElementById('response-area');

// Start the game
function startGame() {
    console.log('Game started');
    // For now, always start with character1 and their first scenario
    loadScenario('character1', 's1');
}

// Load a specific character and scenario
function loadScenario(characterId, scenarioId) {
    currentCharacterId = characterId;
    currentScenarioId = scenarioId;

    const character = characters[characterId];
    const scenario = character.scenarios.find(s => s.id === scenarioId);

    if (!character || !scenario) {
        console.error("Character or scenario not found!");
        characterArea.innerHTML = "<p>Error: Character or scenario not found.</p>";
        dialogArea.innerHTML = "";
        responseArea.innerHTML = "";
        return;
    }

    console.log(`Loading character: ${character.name}, Scenario: ${scenario.problem}`);

    characterArea.innerHTML = `
        <h2>${character.name}</h2>
        <p>${character.description}</p>
        <!-- <img src="${character.image}" alt="${character.name}" width="100"> -->
        <p><em>(Character image placeholder)</em></p>
    `;

    dialogArea.innerHTML = `
        <p><strong>${character.name} says:</strong> ${scenario.problem}</p>
        <textarea id="advice-input" placeholder="Type your advice here..."></textarea>
        <button id="submit-advice-btn">Give Advice</button>
    `;
    responseArea.innerHTML = ""; // Clear previous response

    document.getElementById('submit-advice-btn').addEventListener('click', () => {
        const adviceText = document.getElementById('advice-input').value;
        if (adviceText.trim()) {
            handleAdviceSubmission(adviceText);
        }
    });
}

async function handleAdviceSubmission(adviceText) {
    console.log(`Advice submitted: ${adviceText}`);
    responseArea.innerHTML = `<p>Consulting the oracle (Gemini AI)...</p>`;
    document.getElementById('submit-advice-btn').disabled = true;
    document.getElementById('advice-input').disabled = true;

    const character = characters[currentCharacterId];
    const scenario = character.scenarios.find(s => s.id === currentScenarioId);

    const consequence = await getAdviceResponse(scenario.problem, adviceText);

    responseArea.innerHTML = `<p><strong>Consequence:</strong> ${consequence}</p>`;
    
    dialogArea.innerHTML += `<br><br><button onclick="startGame()">Ask Nick Again</button>`;
    // Re-enable input for a potential new round if not navigating away immediately
    // document.getElementById('submit-advice-btn').disabled = false;
    // document.getElementById('advice-input').disabled = false;
    // document.getElementById('advice-input').value = '';
}

// Start the game when the script loads
startGame(); 