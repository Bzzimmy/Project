import { setApiKey, getApiKey } from '../services/geminiService.js';

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const saveStatusMessage = document.getElementById('save-status-message');

    // Load existing API key into the input field if it exists
    const currentApiKey = getApiKey();
    if (currentApiKey) {
        apiKeyInput.value = currentApiKey;
    }

    saveApiKeyBtn.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            try {
                setApiKey(newApiKey);
                saveStatusMessage.textContent = 'API Key saved successfully!';
                saveStatusMessage.className = 'message success-message';
                saveStatusMessage.style.display = 'block';
            } catch (error) {
                console.error("Error saving API key:", error);
                saveStatusMessage.textContent = 'Error saving API key. See console for details.';
                saveStatusMessage.className = 'message error-message';
                saveStatusMessage.style.display = 'block';
            }
        } else {
            saveStatusMessage.textContent = 'API Key cannot be empty.';
            saveStatusMessage.className = 'message error-message';
            saveStatusMessage.style.display = 'block';
        }
        setTimeout(() => {
            saveStatusMessage.style.display = 'none';
        }, 3000);
    });
}); 