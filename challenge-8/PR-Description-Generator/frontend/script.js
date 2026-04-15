const diffInput = document.getElementById('diff-input');
const generateBtn = document.getElementById('generate-btn');
const loading = document.getElementById('loading');
const output = document.getElementById('output');

const BACKEND_URL = 'http://localhost:3000'; // Change to deployed URL

generateBtn.addEventListener('click', async () => {
  const diff = diffInput.value.trim();
  if (!diff) {
    output.textContent = 'Please enter a git diff.';
    return;
  }

  loading.style.display = 'block';
  output.textContent = '';

  try {
    const response = await fetch(`${BACKEND_URL}/generate-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diff }),
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text || '{}');
    } catch (parseError) {
      data = { error: text || 'Unexpected response from backend' };
    }

    if (response.ok) {
      output.textContent = data.description || 'No description returned.';
    } else {
      const errorMessage = data.error || JSON.stringify(data);
      if (errorMessage.includes('OPENROUTER_API_KEY')) {
        output.textContent = 'Error: Backend is missing OPENROUTER_API_KEY. Create backend/.env and add the OpenRouter key.';
      } else {
        output.textContent = `Error ${response.status}: ${errorMessage}`;
      }
    }
  } catch (error) {
    output.textContent = `Error: Failed to connect to backend. ${error.message}`;
  } finally {
    loading.style.display = 'none';
  }
});