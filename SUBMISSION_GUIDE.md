# 📝 PR Submission Guide - Gym Tracker

## Step 1: Prepare for PR to https://github.com/giteshchaudhari681-art/Kalvium-Challenges

### Current Status
✅ Backend complete with 4 CRUD routes (Express + SQLite)  
✅ Frontend complete (React with components)  
✅ Database schema created  
✅ All validation implemented  
✅ Error handling in place  
✅ Comprehensive README  
✅ Deployment guides created  

### What Needs to Happen Next

1. **Deploy Backend to Render**
   - Push code to GitHub at https://github.com/giteshchaudhari681-art/Kalvium-Challenges
   - On Render: Create web service pointing to `/backend` directory
   - Get live URL: `https://your-gym-tracker.onrender.com`
   - Test health check: `curl https://your-gym-tracker.onrender.com/health`

2. **Deploy Frontend to Netlify**
   - Update `frontend/.env` with live backend URL
   - Run `npm run build` in frontend folder
   - Deploy to Netlify by dragging `build` folder
   - Get live URL: `https://your-gym-tracker.netlify.app`

---

## Step 2: Create the PR

### Branch Name
```
main (deploy to this)
```

### PR Title Format
```
feat: Gym Tracker — Log and track your gym sets
```

### PR Body Template

```markdown
## 💪 Gym Tracker - Track Your Workouts

### What It Is
A web app to log and track your daily gym sets — exercises, weights, and reps — so you always know exactly where to start next time.

### The Problem It Solves
I kept forgetting what weight I lifted in my last session and always had to guess, wasting time and breaking my workout rhythm. This app records every set so I instantly know where to start—no more standing at the rack wondering "Was it 100kg or 110kg?"

### Operations Implemented
✅ CREATE - POST /workouts → Log a new workout  
✅ READ - GET /workouts → View all workouts  
✅ UPDATE - PUT /workouts/:id → Edit a workout  
✅ DELETE - DELETE /workouts/:id → Remove a workout  

### Live URLs
- **Frontend**: [Will add after Netlify deployment]
- **Backend**: [Will add after Render deployment]

### Tech Stack
- Backend: Node.js + Express + SQLite
- Frontend: React + CSS3
- Deployment: Render + Netlify

### Database
- SQLite with `workouts` table
- Fields: id, exercise, weight, reps, date, createdAt, updatedAt
- Persists across server restarts

### Testing
- ✅ All 4 CRUD operations tested locally
- ✅ Form validation prevents empty submissions
- ✅ Error boundaries handle network failures
- ✅ Loading states improve UX
- ✅ Data persists after refresh

### Environment Files
- `.env` NOT committed (in .gitignore)
- `.env.example` committed (for reference)

### Deployment Instructions
See DEPLOYMENT_GUIDE.md for full setup.

Quick start:
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd frontend && npm install && npm start
```

### Why It Works
- No user auth needed (solo app)
- SQLite needs no external DB server
- React components are reusable
- 4 route separation is clean and scalable

### What I Excluded (Intentionally)
- User authentication (overkill for MVP)
- Analytics/charts (simple list is enough)
- Pre-built workout plans (app logs only, doesn't plan)
- Social features (solo project)
- Mobile app (web covers 95% of use)
```

---

## Step 3: Deployment Checklist Before PR

- [ ] Backend running locally on port 5000
- [ ] Frontend running locally on port 3000 (after npm install completes)
- [ ] All 4 CRUD operations working end-to-end
- [ ] Data persists after page refresh
- [ ] Error messages show on invalid input
- [ ] Loading states work smoothly
- [ ] `.env` files are in .gitignore (not committed)
- [ ] README.md answers all 3 questions
- [ ] Running `npm install` in backend and frontend works
- [ ] Backend health check returns `{ status: "ok" }`

---

## Step 4: Steps to Deploy

### A) Deploy Backend (Render)

1. Push to GitHub
   ```bash
   git add .
   git commit -m "feat: Gym Tracker — Log and track gym workouts"
   git push origin main
   ```

2. Go to **render.com**
   - Dashboard → New Web Service
   - Connect GitHub → Select your repo
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `node server.js`
     - Environment Variables: Add `PORT=3000`
   - Deploy

3. Wait 2-4 minutes
   - You'll get: `https://gym-tracker-xxxxx.onrender.com`

4. **Test it**
   ```bash
   curl https://gym-tracker-xxxxx.onrender.com/health
   # Response: { "status": "ok" }
   ```

### B) Deploy Frontend (Netlify)

1. **Update backend URL in frontend**
   ```bash
   # In frontend/.env
   REACT_APP_BACKEND_URL=https://gym-tracker-xxxxx.onrender.com
   ```

2. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Netlify**
   - Go to **netlify.com**
   - "Add new site" → "Deploy manually"
   - Drag `frontend/build` folder into drop zone
   - Get URL: `https://gym-tracker-xxxxx.netlify.app`

4. **Update PR with live URLs**

---

## Step 5: Final PR Submission

Once deployed, edit PR body to include:

```markdown
## ✅ DEPLOYED & LIVE

**Frontend**: https://gym-tracker-xxxxx.netlify.app  
**Backend**: https://gym-tracker-xxxxx.onrender.com  

### Quick Demo
1. Visit frontend URL
2. Log a workout: Bench Press, 100kg, 10 reps
3. See it appear in the list
4. Click Edit, change weight to 105kg
5. Click Delete to remove
6. Refresh page - all data persists

### All Requirements Met
- ✅ Working frontend (React, fully functional)
- ✅ Express backend with exactly 4 routes (POST, GET, PUT, DELETE)  
- ✅ SQLite database that persists data
- ✅ Both deployed at live URLs
- ✅ README answers all 3 questions
```

---

## Step 6: Video Recording (3 minutes max)

### Part 1: Live Demo (~90 seconds)
1. Open deployed frontend URL
2. Create: Log "Squat" 150kg, 5 reps, today
3. Show: It appears in the list
4. Edit: Change weight to 155kg, save
5. Show: It updated
6. Delete: Remove one entry
7. Show: It's gone
8. Refresh page: Data still there
9. Say out loud: "This solves the problem of forgetting my last weight"

### Part 2: Code Explanation (~60 seconds)
Example: Explain the POST route
```javascript
// Why I built it this way:
// 1. Validates all required fields
// 2. Uses parameterized queries (prevents SQL injection)
// 3. Returns created workout with ID so frontend can show it immediately
// 4. Status 201 indicates resource created
```

### Part 3: Problem Statement (~30 seconds)
"My problem: I kept forgetting what weight I lifted last session. This app stores every set with date, weight, and reps. Now I never guess again."

---

## Troubleshooting

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### "node_modules too large"
- Don't commit node_modules (should be in .gitignore)
- Render/Netlify will run `npm install` automatically

### "CORS error in frontend"
- Backend has CORS enabled: `app.use(cors())`
- Check `REACT_APP_BACKEND_URL` in frontend/.env

### "Database locked"
- Make sure only one backend instance is running
- Restart backend: `npm start`

---

## Submission Links Template

When submitting:

```
GitHub PR: https://github.com/giteshchaudhari681-art/Kalvium-Challenges/pull/<your-pr-number>
Video: https://drive.google.com/open?id=<your-video-id>
```

---

## Timeline

- [ ] Day 1-2: Build (✅ DONE)
- [ ] Day 3: Deploy backend to Render
- [ ] Day 4: Deploy frontend to Netlify
- [ ] Day 5: Record 3-minute video
- [ ] Day 6: Submit PR + video link

---

**Ready to ship!** 🚀
