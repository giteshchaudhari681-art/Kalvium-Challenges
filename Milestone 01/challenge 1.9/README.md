# Vibe vs. Pair Challenge

This challenge involves building the same Task Manager application twice to compare two distinct AI-assisted development workflows: **Vibe Coding** (using generative UI/app tools) and **AI Pair Programming** (using editor-integrated assistants). By the end, you'll have a clear understanding of the strengths and weaknesses of each approach.

## The App You Are Building

You will be building a standalone Task Manager. You must strictly follow the requirements outlined in the [app-spec.md](./app-spec.md) file for both versions.

## Your Folders

- `/vibe-version`: Use this folder for the version built using a "vibe" tool (e.g., Lovable, v0, Google AI Studio Build).
- `/pair-version`: Use this folder for the version built using an AI pair programming assistant (e.g., GitHub Copilot, Cursor).

## Live Deployments

- Vibe version: (https://kalvium-challenges-nrlt.vercel.app/)
- Pair version: (https://kalvium-challenges.vercel.app/)

## Comparison Table

Fill out the following table after completing both versions:

| Dimension          | Vibe Version                         | Pair Version              | Verdict
| **Speed**          | Generated full app in 8 min          | Took 1h 20m               | vibe
| **Control**        | No control over structure            | Full control              | pair
| **Code Quality**   | 2 large components (180+ lines)      | Max 70 lines per file     | pair
| **Explainability** | Had to re-read reducer logic 3 times | Understood every function | pair
| **Editability**    | Filter logic spread across files     | Centralized state         | pair

## When I Would Use Each Tool
### Vibe Coding Tool
I would use a vibe coding tool for rapid prototyping or idea validation. In my build, the entire app was generated in under 10 minutes with a working UI and basic functionality. This makes it ideal when speed is more important than structure or long-term maintainability.

However, I noticed that the generated code included unnecessary abstractions (like reducer logic) and larger components, which made it harder to understand and modify.

### AI Pair Programming
I would use AI pair programming for production-level development. While it took significantly longer (~1 hour 20 minutes), I had full control over the architecture, state management, and component structure.

This allowed me to write smaller, cleaner components and understand every part of the code. Making changes (like modifying filters or UI behavior) was much easier because the logic was centralized and intentional.
## Tools Used

- **Vibe tool used: *Antigravity* 
- **Pair tool used: *vscode + codex* 

## How to Submit

1. **PR Link:** [Insert your Pull Request link here]
2. **Video Link:** [Insert your Loom or recorded demo link here]

Last updated: 2026-04-09
