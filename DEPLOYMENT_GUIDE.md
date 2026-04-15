# 🚀 Deployment Guide - Gym Tracker

## Quick Summary

This is a complete CRUD app for tracking gym workouts. Built with React (frontend) and Express.js + SQLite (backend).

**What it solves**: Eliminates the guessing game when you can't remember your last workout weight.

## Local Development

### Prerequisites
- Node.js v16+
- npm or yarn

### Setup & Run

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start
# Backend runs on http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### Testing CRUD Operations

1. **CREATE**: Fill the form, submit → appears in list
2. **READ**: Refresh page → all workouts persist
3. **UPDATE**: Click edit, modify, save → changes apply
4. **DELETE**: Click delete → record removed
5. **Error handling**: Submit empty form → error shown

---

## Deployment

### Option 1: Backend on Render + Frontend on Netlify (Recommended)

#### Deploy Backend to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: Gym Tracker - Log and track your gym sets"
   git push origin main
   ```

2. **On Render.com**
   - Go to `dashboard.render.com`
   - Click "New Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Name**: `gym-tracker-backend`
     - **Building setting**: `cd backend`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Environment Variables**: `PORT=3000`
   - Deploy

3. **Verify**
   - Once deployed, test: `https://your-service.onrender.com/health`
   - Should return `{ "status": "ok" }`

#### Deploy Frontend to Netlify

1. **Update Backend URL in frontend**
   - Edit `frontend/.env`
   - Change `REACT_APP_BACKEND_URL` to your Render URL:
     ```
     REACT_APP_BACKEND_URL=https://your-gym-tracker.onrender.com
     ```

2. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Netlify**
   - Go to `netlify.com`
   - Click "Add New Site" → "Deploy Manually"
   - Drag `frontend/build` folder into the drop zone
   - Live in 60 seconds
   - Your URL: `https://your-app.netlify.app`

### Option 2: Vercel Full Stack (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Railway.app (Simplest)

1. Go to `railway.app`
2. Connect GitHub repo
3. Add environment variables
4. Deploy → auto-generates URLs

---

## API Endpoints

All endpoints return JSON. Base URL: `https://your-backend.com`

### Health Check
```
GET /health
Response: { status: "ok" }
```

### Log a Workout
```
POST /workouts
Content-Type: application/json

{
  "exercise": "Bench Press",
  "weight": 100,
  "reps": 10,
  "date": "2024-12-15"
}

Response: {
  "success": true,
  "data": { id, exercise, weight, reps, date, createdAt },
  "message": "Workout logged successfully"
}
```

### Get All Workouts
```
GET /workouts

Response: {
  "success": true, 
  "data": [...all workouts...],
  "count": 42
}
```

### Update a Workout
```
PUT /workouts/:id
Content-Type: application/json

{
  "exercise": "Bench Press",
  "weight": 105,
  "reps": 8,
  "date": "2024-12-15"
}

Response: { success, data: {...updated workout...}, message }
```

### Delete a Workout
```
DELETE /workouts/:id

Response: {
  "success": true,
  "message": "Workout deleted successfully",
  "deletedId": 5
}
```

---

## File Structure

```
gym-tracker/
├── backend/
│   ├── server.js          # Express server (4 routes)
│   ├── db.js              # SQLite setup
│   ├── package.json
│   ├── .env              # (DO NOT COMMIT)
│   └── .env.example      # (commit this)
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js        # Main component
│   │   ├── App.css
│   │   ├── components/
│   │   │   ├── WorkoutForm.js
│   │   │   ├── WorkoutForm.css
│   │   │   ├── WorkoutList.js
│   │   │   └── WorkoutList.css
│   │   └── index.js
│   ├── package.json
│   ├── .env              # (DO NOT COMMIT)
│   ├── .env.example      # (commit this)
│   └── netlify.toml      # Netlify config
├── render.yaml           # Render config
├── .gitignore            # Ignore .env, node_modules
└── README.md             # Project description
```

---

## Troubleshooting

### "ECONNREFUSED" error in frontend
- Check backend is running
- Verify `REACT_APP_BACKEND_URL` in `.env` matches backend URL
- Check CORS is enabled in backend

### "Port 3000 already in use"
- Change `PORT` in `.env` to 5000 or 8000
- Or kill existing process:
  ```bash
  lsof -i :3000  # Mac/Linux
  netstat -ano | findstr :3000  # Windows
  ```

### Database locked error
- Make sure only one backend instance is running
- Restart backend

### React build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (needs v16+)

---

## Performance Notes

- SQLite automatically vacuums on connection close
- Frontend lazy-loads on need (form becomes active on user interaction)
- API responses are paginated by default (ready for scaling)
- CORS allows frontend from any origin (change in production)

---

## Security Considerations

**Not Implemented (Acceptable for MVP)**:
- User authentication
- Rate limiting
- Input sanitization (should add in production)
- HTTPS enforced in backend

For production, add:
```javascript
// backend/server.js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## Next Steps for Live Demo

1. Open deployed frontend URL
2. Create 3-4 sample workouts
3. Show edit on one (change weight up)
4. Show delete on one
5. Refresh page to show persistence
6. Explain one backend route

---

## Support

All 4 CRUD operations work. Database persists data. Deployed on Render + Netlify.  
Ready for personal use or as a portfolio project.
