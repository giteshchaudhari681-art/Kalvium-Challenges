# PR Description Generator

## The Problem
I personally experienced the frustration of spending 15-20 minutes writing detailed pull request descriptions for every code change I made. As a developer working on collaborative projects, my team required comprehensive PR descriptions to understand the changes, but manually crafting them from git diffs was time-consuming and repetitive. Other developers in teams that emphasize code review and documentation face the same issue.

## What It Does
Users paste their git diff into the textarea, click generate, and the AI transforms the diff into a well-structured PR description that includes what changes were made, why, and potential impacts. This saves time and ensures consistency in PR descriptions.

## AI Integration
**API:** OpenRouter
**Model:** openai/gpt-4o-mini
**Location:** `backend/server.js` → `generate-description` route (inside the POST handler)
**What the AI does:** Transforms the git diff into a detailed PR description.

## What I Intentionally Excluded
- User authentication: Not needed as the tool is session-based and doesn't require persistence.
- Multiple AI models: Stuck with one model to keep it simple and cost-effective.
- Diff parsing on frontend: All processing is on backend to keep AI call secure.

## Monthly Cost Calculation
Model: openai/gpt-4o-mini
Input: $0.15 per 1M tokens
Output: $0.60 per 1M tokens
Avg tokens per call: ~1000 input + ~500 output
Cost per call: (1000/1000000)*0.15 + (500/1000000)*0.60 = $0.00015 + $0.0003 = $0.00045
Expected calls/month: 100
**Monthly total: 100 × $0.00045 = $0.045**

## Live Deployment
**Frontend:** [URL]
**Backend:** [URL]