import { getAdviceResponse, getApiKey } from '../services/geminiService.js';

console.log('Advice Simulator loaded!');

// Check for API key on load and prompt if not set
if (!getApiKey()) {
    alert("Gemini API Key not found. Please go to Settings to add your key for the game to work correctly with AI.");
}

// Sample Character Data
const characters = {
    character1: {
        id: "character1",
        name: "Nervous Nick",
        description: "A very anxious person who overthinks everything. He's well-meaning but always expects the worst.",
        image: "src/assets/nick.png", // Placeholder - create this image
        aiPersonaPrompt: "You are narrating the outcome for Nervous Nick. Nick is perpetually anxious and a bit of a catastrophizer. When describing consequences, even for good advice, subtly hint at his lingering anxieties or how he almost fumbled it. If the advice is bad, describe how his worst fears are realized in a detailed, slightly exaggerated, and comically unfortunate way. Maintain a tone of sympathetic understanding for his nervousness, but don't be afraid to highlight the often absurd results of his anxiety when mixed with the advice given. Focus on his internal monologue of worry.",
        scenarios: [
            {
                id: "s1",
                problem: "I have a huge presentation tomorrow for work, and I'm convinced I'm going to forget all my lines, spill coffee on my boss, and then the projector will probably explode. What on earth should I do to survive this?",
            },
            {
                id: "s2",
                problem: "I want to ask my crush out on a date, but I'm terrified! What if I trip while walking up to them? What if my voice cracks? What if they laugh? It feels like a social minefield! Any advice on how not to make a complete fool of myself?"
            }
        ]
    },
    character2: {
        id: "character2",
        name: "Captain Optimist",
        description: "An overwhelmingly enthusiastic and positive individual. Sees the good in everything, sometimes to a fault.",
        image: "src/assets/captain.png", // Placeholder - create this image
        aiPersonaPrompt: "You are narrating the outcome for Captain Optimist. Captain Optimist is incredibly cheerful and always finds a silver lining, no matter how dire the situation might seem due to the advice. Your narration should reflect this unwavering positivity. Even if the advice leads to a disastrous outcome, Captain Optimist should somehow interpret it as a 'valuable learning experience' or focus on an unexpectedly positive tiny detail. Use exclamation points liberally and maintain a very upbeat, encouraging, and slightly naive tone. The consequences should be described, but always framed through their rose-tinted glasses.",
        scenarios: [
            {
                id: "s1",
                problem: "My band's first gig is tonight at a place that's... well, it's a bit of a dive. But I know it's going to be AMAZING! Any advice on how to make sure our debut is an absolute smash hit and everyone feels the positive vibes?",
            },
            {
                id: "s2",
                problem: "I'm trying to learn how to bake a super complicated, seven-layer cake for my friend's birthday! It looks tricky, but I'm SO excited for the challenge! What's your best tip to ensure this baking adventure is a triumph of sugary goodness?"
            }
        ]
    },
    character3: {
        id: "character3",
        name: "Grumpy Greg",
        description: "A cynical and perpetually annoyed old man. He's seen it all and is not impressed by much.",
        image: "src/assets/greg.png", // Placeholder - create this image
        aiPersonaPrompt: "You are narrating the outcome for Grumpy Greg. Greg is a curmudgeon; he's cynical, easily irritated, and rarely satisfied. Your narration must reflect his grumpy demeanor. If the advice is good, he might grudgingly admit it wasn't a *complete* disaster, perhaps with a sarcastic comment. If the advice is bad, he'll complain extensively about the stupidity of the advice and how it just made things worse, as he predicted. Use dry wit, sarcasm, and express his general disdain for... well, most things. He often mutters under his breath. The consequences should be filtered through his perpetually annoyed perspective.",
        scenarios: [
            {
                id: "s1",
                problem: "These darn squirrels are eating all the birdseed from my feeder. I've tried yelling at them, but they just chatter back. Got any *actually useful* advice for getting rid of these fluffy-tailed rats, or am I just doomed to feed their insatiable appetites? Don't suggest anything too strenuous.",
            },
            {
                id: "s2",
                problem: "My nephew wants me to use one of those new-fangled 'smart' phones. Says it'll make my life easier. I reckon it'll just be another complicated piece of junk to frustrate me. What's your take? Should I even bother, or is it just a headache waiting to happen? And make it quick."
            }
        ]
    }
};

// Basic game state
let currentCharacterId = 'character1'; // Start with Nick
let currentScenarioIndex = 0;

// DOM Elements
const characterArea = document.getElementById('character-area');
const dialogArea = document.getElementById('dialog-area');
const responseArea = document.getElementById('response-area');

// Start the game
function startGame() {
    console.log('Game started');
    // Simple progression: cycle through characters, then cycle their scenarios
    const characterIds = Object.keys(characters);
    let charIndex = characterIds.indexOf(currentCharacterId);

    currentScenarioIndex++;
    if (currentScenarioIndex >= characters[currentCharacterId].scenarios.length) {
        currentScenarioIndex = 0;
        charIndex = (charIndex + 1) % characterIds.length;
        currentCharacterId = characterIds[charIndex];
    }
    loadCurrentScenario();
}

function loadCurrentScenario() {
    const character = characters[currentCharacterId];
    const scenario = character.scenarios[currentScenarioIndex];

    if (!character || !scenario) {
        console.error("Character or scenario not found!");
        // Potentially loop back to the first character or show an error/end game message
        characterArea.innerHTML = "<p>Error: Ran out of content or content not found.</p>";
        dialogArea.innerHTML = "<button onclick=\"resetGame()\">Reset Game</button>";
        responseArea.innerHTML = "";
        return;
    }

    console.log(`Loading Character: ${character.name}, Scenario: ${scenario.problem}`);

    characterArea.innerHTML = `
        <h2>${character.name}</h2>
        <p>${character.description}</p>
        <!-- <img src="${character.image}" alt="${character.name}" style="max-width:150px; border-radius:5px;"> -->
        <p><em>(Image for ${character.name} needed at ${character.image})</em></p>
    `;

    dialogArea.innerHTML = `
        <p><strong>${character.name} says:</strong> ${scenario.problem}</p>
        <textarea id="advice-input" placeholder="Type your wise advice here..."></textarea>
        <button id="submit-advice-btn">Offer Advice</button>
    `;
    responseArea.innerHTML = ""; 

    document.getElementById('submit-advice-btn').addEventListener('click', () => {
        const adviceText = document.getElementById('advice-input').value;
        if (adviceText.trim()) {
            handleAdviceSubmission(adviceText);
        } else {
            responseArea.innerHTML = "<p style='color:orange;'>Come on, offer some actual advice!</p>";
        }
    });
}

async function handleAdviceSubmission(adviceText) {
    console.log(`Advice submitted: ${adviceText}`);
    responseArea.innerHTML = `<p><i>The winds of fate are stirring...</i></p>`;
    const submitButton = document.getElementById('submit-advice-btn');
    const adviceInput = document.getElementById('advice-input');
    if(submitButton) submitButton.disabled = true;
    if(adviceInput) adviceInput.disabled = true;

    const character = characters[currentCharacterId];
    const scenario = character.scenarios[currentScenarioIndex];

    // Pass the character's specific AI persona prompt along with the problem and advice
    const consequence = await getAdviceResponse(character.aiPersonaPrompt, scenario.problem, adviceText);

    responseArea.innerHTML = `<p><strong>Consequence:</strong> ${consequence}</p>`;
    
    dialogArea.innerHTML += `<br><br><button onclick="startGame()">Next Character/Problem</button>`;
}

window.resetGame = function() {
    currentCharacterId = 'character1';
    currentScenarioIndex = -1; // So it increments to 0 in startGame
    startGame();
}

// Initial load
resetGame(); // Use resetGame to correctly initialize and load the first scenario 