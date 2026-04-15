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

    const data = await response.json();

    if (response.ok) {
      output.textContent = data.description;
    } else {
      output.textContent = `Error: ${data.error}`;
    }
  } catch (error) {
    output.textContent = 'Error: Failed to connect to backend.';
  } finally {
    loading.style.display = 'none';
  }
});