# 🚀 Quick Start Guide

## What's Ready

✅ **Backend**: Fully built and running on port 5000  
✅ **Frontend**: All React code completed  
✅ **Database**: SQLite schema ready  
✅ **Documentation**: Complete guides for deployment  

## Start the App Locally (3 steps)

### Terminal 1 - Backend (Already Running)
```bash
# Backend is already running on http://localhost:5000
# If you need to restart it:
cd backend
npm install  # (skip if already done)
npm start
```

Check health: http://localhost:5000/health

### Terminal 2 - Frontend  
```bash
cd frontend
npm install  # (this is installing now, grab coffee!)
npm start
```

Frontend will open at http://localhost:3000

### Terminal 3 - Test Backend (Optional)
```bash
# Create a workout
curl -X POST http://localhost:5000/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "exercise": "Bench Press",
    "weight": 100,
    "reps": 10,
    "date": "2024-12-15"
  }'

# Get all workouts
curl http://localhost:5000/workouts
```

---

## What to Test

1. **Create** - Fill form and log a workout
2. **Read** - See it appear in the list
3. **Update** - Click edit, change weight, save
4. **Delete** - Click delete, it disappears
5. **Persist** - Refresh page, data is still there

---

## Files to Know

| File | Purpose |
|------|---------|
| `backend/server.js` | 4 REST routes (POST,GET,PUT,DELETE) |
| `backend/db.js` | SQLite database setup |
| `frontend/src/App.js` | Main React component |
| `frontend/src/components/WorkoutForm.js` | Form to create/edit |
| `frontend/src/components/WorkoutList.js` | Table of workouts |
| `README.md` | Project description (answers 3 Qs) |
| `DEPLOYMENT_GUIDE.md` | How to deploy to Render + Netlify |
| `SUBMISSION_GUIDE.md` | How to create the GitHub PR |

---

## Deployment Checklist

- [ ] Backend running locally ✅
- [ ] Frontend installed locally  
- [ ] All 4 CRUD operations work  
- [ ] Data persists after refresh
- [ ] Error messages show
- [ ] `.env` is in .gitignore
- [ ] Push to GitHub
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Netlify
- [ ] Record 3-minute demo video
- [ ] Create PR with live URLs + video link

---

## Key Points

**The Problem**: I kept forgetting what weight I lifted last session  
**The Solution**: This app logs every set with date/weight/reps  
**Why It Works**: Simple, fast, single-purpose  
**Why It Doesn't Have**: Auth (overkill), analytics (not needed), social (solo app)

---

## Common Issues

### Frontend npm install taking forever?
- React has ~300 dependencies, it's normal
- Takes 5-15 minutes depending on internet speed
- Coffee time ☕

### "Cannot find module" error?
- Run `npm install` in that folder
- Check internet connection
- Try deleting `node_modules` and reinstalling

### "CORS error"?
- Backend has CORS enabled
- Check `REACT_APP_BACKEND_URL` in frontend/.env
- Restart both frontend and backend

### Port already in use?
- Backend on port 5000
- Frontend on port 3000
- If conflicts: change PORT in `.env`

---

## Next: Deploy to Production

See **DEPLOYMENT_GUIDE.md** for:
- How to deploy backend to Render
- How to deploy frontend to Netlify
- How to test live deployment
- How to troubleshoot issues

See **SUBMISSION_GUIDE.md** for:
- How to create the PR
- PR template with live URLs
- Video recording tips
- Submission process

---

**Status**: 🟢 Ready for local testing  
**Next**: Deploy to Render + Netlify  
**Final**: Record video + submit PR  

Happy coding! 🎉
