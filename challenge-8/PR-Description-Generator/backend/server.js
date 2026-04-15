const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/generate-description', async (req, res) => {
  const { diff } = req.body;
  if (!diff) {
    return res.status(400).json({ error: 'Diff is required' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Generate a detailed pull request description from the following git diff:\n\n${diff}\n\nPlease include what changes were made, why, and any potential impacts.`
          }
        ],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.json({ description: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Failed to generate description' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});