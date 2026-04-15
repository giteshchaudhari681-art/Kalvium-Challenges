# 💪 Gym Tracker

## What It Is

A web app to log and track your daily gym sets — exercises, weights, and reps — so you always know exactly where to start next time.

## The Problem It Solves

I kept forgetting what weight I lifted in my last session and always had to guess, wasting time and breaking my workout rhythm. This app records every set I do with the exact exercise, weight, and reps, so I instantly know where to start without the mental overhead. No more standing at the rack wondering "Was it 100kg or 110kg?"

## What I Intentionally Excluded

- **User authentication**: Adding login would require sessions or JWT tokens, significantly increasing complexity. Since I only need one person (me) to use this, a single-user app is perfect.
- **Social features**: Sharing workouts or comparing with friends and adding followers, adding messaging and competing on leaderboards.
- **Workout plans**: Pre-built routines, AI suggestions — the app only logs what you actually did. Planning is a separate problem.
- **Analytics**: Charts, max lifts, progress tracking. The history view is enough; math comes later if needed.
- **Mobile app**: This is web-only. A native app would mean maintaining iOS and Android codebases.

## Tech Stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: React + CSS3
- **Deployed**: Render (backend) + Netlify (frontend)

## Live Deployment

**Frontend:** [Will be deployed to Netlify](https://your-gym-tracker.netlify.app)  
**Backend:** [Will be deployed to Render](https://your-gym-tracker.onrender.com)

## How to Run Locally

### Prerequisites
- Node.js (v16 or higher)
- npm/yarn

### Backend Setup

```bash
cd backend
npm install
echo "PORT=3000" > .env
npm start
```

Backend runs at `http://localhost:3000`

Test health check: `curl http://localhost:3000/health`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000` (React default)

Update `REACT_APP_BACKEND_URL` in frontend if backend is on different port.

## API Routes

All routes return JSON and expect JSON input.

### Health Check
```
GET /health
Returns: { status: "ok" }
```

### Create a Workout
```
POST /workouts
Body: {
  "exercise": "Bench Press",
  "weight": 100,
  "reps": 10,
  "date": "2024-12-15"
}
Returns: { success: true, data: { id, exercise, weight, reps, date, createdAt }, message }
```

### Get All Workouts
```
GET /workouts
Returns: { success: true, data: [workout1, workout2, ...], count: N }
```

### Update a Workout
```
PUT /workouts/:id
Body: {
  "exercise": "Bench Press",
  "weight": 105,
  "reps": 8,
  "date": "2024-12-15"
}
Returns: { success: true, data: updatedWorkout, message }
```

### Delete a Workout
```
DELETE /workouts/:id
Returns: { success: true, message, deletedId }
```

## Directory Structure

```
├── backend/
│   ├── server.js           # Express server with 4 CRUD routes
│   ├── db.js               # SQLite database setup
│   ├── package.json        # Node dependencies
│   ├── .env.example        # Environment variables template
│   └── .gitignore          # Ignore node_modules and .env
├── frontend/
│   ├── public/
│   │   └── index.html      # Main HTML entry
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # App styling
│   │   ├── index.js        # React DOM render
│   │   ├── index.css       # Global styles
│   │   └── components/
│   │       ├── WorkoutForm.js
│   │       ├── WorkoutForm.css
│   │       ├── WorkoutList.js
│   │       └── WorkoutList.css
│   ├── package.json
│   └── .gitignore
└── README.md
```

## Testing the App

### Local Test Sequence:

1. **Create** - Fill the form, submit. Does it appear in the list?
2. **Read** - Refresh the page. Are all workouts still visible?
3. **Update** - Click edit on a workout, change weight, save. Did it update?
4. **Delete** - Click delete. Is it gone?

All four operations must work before deployment.

### Edge Cases Tested:
- Empty form submission → Blocked with error message
- Duplicate exercise same day → Both entries logged (app logs sessions, not unique exercises)
- Delete non-existent ID → 404 error (handled gracefully)
- No internet connection → "Failed to fetch" error shown

## Deployment

### Backend (Render)

1. Push to GitHub (ensure `.env` is in `.gitignore`)
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Environment: Add `PORT=3000`
7. Deploy → Check `/health` endpoint after 2-4 minutes

### Frontend (Netlify)

1. Go to netlify.com → New site
2. Drag your `frontend/` folder
3. Live in 60 seconds

**Important**: Update `REACT_APP_BACKEND_URL` in frontend code to point to deployed Render URL before building for production.

## Code Highlights

### Why I Built It This Way

**Express + SQLite**: Fast iteration. SQLite is zero-config, requires no external database server. Perfect for solo projects.

**React Frontend**: Component-based UI makes it easy to add features later (filters, stats, etc.). State management is simple for this scale.

**Separation of Concerns**: Backend handles all data logic (validation, persistence). Frontend only handles UI and fetch calls. Clear boundary = easier debugging.

**No Authentication**: Single-user app. Adding JWT would add 30+ lines of boilerplate per route for no benefit. Ship what you need, not what startups ship.

## Future Improvements (Not Implemented)

- Export workouts as CSV
- Workout templates (save common exercises)
- Rest timer between sets
- 1-rep max calculator
- Offline mode with service workers

## License

MIT - Use this wherever you want.

---

**Built by someone tired of guessing weights.** ✅
