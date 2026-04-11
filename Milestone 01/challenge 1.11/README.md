# AI Chatbot

## What I Built
A minimal AI chatbot with a vanilla JavaScript frontend and a Node.js Express backend. The frontend stores the full conversation in a `messages` array and sends that full history to the backend on every request so the model can respond with context from earlier turns.

## API and Model
**API:** OpenRouter  
**Model:** `openai/gpt-4o-mini`

**Why backend only:** The OpenRouter key cannot be shipped in frontend JavaScript because anyone can read bundled client code or inspect browser network requests and steal the credential. Routing the AI request through the backend keeps the secret server-side and prevents unauthorized use of the account tied to that key.

**Fallback provider:** Google Gemini API. If OpenRouter credits run out, switch the request URL from `https://openrouter.ai/api/v1/chat/completions` to `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` and change the model name from `openai/gpt-4o-mini` to `gemini-1.5-flash`.

## Live Deployment
**Frontend:** Add your deployed Netlify or Vercel URL here  
**Backend:** Add your deployed Render URL here

## Local Setup
1. Create `backend/.env` from `backend/.env.example`.
2. Set `OPENROUTER_API_KEY` in `backend/.env`.
3. Run `cd backend && npm install`.
4. Run `npm start`.
5. Open `frontend/index.html` in a browser, or visit `http://localhost:3000` because the backend also serves the frontend files.
6. Before deploying the frontend, update `DEPLOYED_API_BASE_URL` in `frontend/script.js` to your Render backend URL.

## Project Structure
```text
backend/
  .env.example
  package.json
  server.js
frontend/
  index.html
  script.js
  styles.css
```
