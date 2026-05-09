# Quick Start Guide - CardioSentinel Remote

Get the full MERN stack application running in 15 minutes.

## Prerequisites

- **Node.js** 16+ ([download](https://nodejs.org))
- **Python** 3.8+ ([download](https://www.python.org))
- **MongoDB Atlas** free account ([register](https://www.mongodb.com/cloud/atlas))
- **Git** ([download](https://git-scm.com))

## 1️⃣ Set Up MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user with password
5. Whitelist IP `0.0.0.0/0` (for development)
6. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/cardiosentinel`

## 2️⃣ Start Backend (3 minutes)

```bash
# Open terminal in project root
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cardiosentinel
# JWT_SECRET=your-secret-key-here

# Start server
npm run dev
```

✅ Backend runs on `http://localhost:5000`

Check: Open browser → `http://localhost:5000/api/health`

## 3️⃣ Start AI Service (3 minutes)

```bash
# Open NEW terminal
cd ai-service

# Create Python virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env (optional, defaults are fine)
cp .env.example .env

# Start Flask
python app.py
```

✅ AI service runs on `http://localhost:8000`

Check: Open browser → `http://localhost:8000/health`

## 4️⃣ Start Frontend (3 minutes)

```bash
# Open ANOTHER terminal
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# .env is already configured for local development

# Start React
npm start
```

✅ Frontend opens automatically on `http://localhost:3000`

## 🎯 Test the Application

### 1. Check All Services Running

```
✅ Frontend: http://localhost:3000 (React app visible)
✅ Backend: http://localhost:5000/api/health (JSON response)
✅ AI: http://localhost:8000/health (JSON response)
✅ MongoDB: Connected (check backend console)
```

### 2. Test Authentication

1. Go to Frontend → Login page
2. Create account: 
   - Email: `test@example.com`
   - Password: `Test@1234`
3. Login
4. Should see dashboard

### 3. Test Patient Creation

1. Navigate to "Patients"
2. Click "New Patient"
3. Fill form → Submit
4. Patient appears in list

### 4. Test AI Prediction

1. Go to Patient Detail
2. Click "Record Telemetry"
3. Fill vital signs → Submit
4. AI prediction runs automatically
5. Risk score appears on patient page

## 📁 Project Structure

```
CardioSentinel-MERN/
├── frontend/          ← React (port 3000)
├── backend/           ← Express API (port 5000)
├── ai-service/        ← Flask (port 8000)
├── report/            ← Documentation
└── README.md
```

## 🔧 Environment Variables

### Backend (backend/.env)
```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (frontend/.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=CardioSentinel Remote
```

### AI Service (ai-service/.env)
```
FLASK_PORT=8000
FLASK_ENV=development
MODEL_PATH=model/cardiac_model.pkl
SCALER_PATH=model/scaler.pkl
```

## 📝 Default Test Account

Once backend is running, you can:

1. Create account via signup form
2. Or insert test user directly in MongoDB:

```json
{
  "username": "clinician1",
  "email": "clinician@test.com",
  "password": "hashed-password",
  "fullName": "Test Clinician",
  "role": "clinician"
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Port 3000 (Frontend)
npx kill-port 3000
# Port 5000 (Backend)
npx kill-port 5000
# Port 8000 (AI)
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill
```

### MongoDB Connection Error
- Verify connection string in `.env`
- Check MongoDB Atlas whitelist (0.0.0.0/0)
- Test connection: `mongosh "mongodb+srv://..."`

### AI Service Not Found
- Check Flask is running on port 8000
- Check `AI_SERVICE_URL` in backend `.env`
- Verify network connectivity

### Frontend Can't Connect to API
- Check backend running on 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

## 📚 Next Steps

1. **Read Full Documentation**
   - [Backend README](./backend/README.md)
   - [Frontend README](./frontend/README.md)
   - [AI Service README](./ai-service/README.md)

2. **Integrate Your Models**
   - See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
   - Place trained models in `ai-service/model/`

3. **Deploy to Cloud**
   - See [Deployment Guide](./report/Deployment.md)
   - Deploy to Vercel, Render, MongoDB Atlas

4. **Write Report**
   - See [Project Report Template](./report/ProjectReport.md)

## 🚀 Common Commands

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - AI Service
cd ai-service && python app.py

# Terminal 3 - Frontend
cd frontend && npm start

# Build for production
cd frontend && npm run build
cd backend && npm run build  (if applicable)

# Run tests
npm test

# Check MongoDB collections
mongosh <connection-string>
```

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] Node.js and Python installed
- [ ] Backend running on 5000
- [ ] AI service running on 8000
- [ ] Frontend running on 3000
- [ ] Can login to application
- [ ] Can create patient
- [ ] Can record telemetry
- [ ] AI prediction working
- [ ] Risk score displaying

## 📞 Support

If stuck:

1. Check terminal output for error messages
2. Review error in browser console (F12)
3. Check service URLs in `.env` files
4. Read full README files in each folder
5. Check MongoDB Atlas dashboard

## 🎉 You're Ready!

Your CardioSentinel Remote application is now running with:

✅ Patient monitoring dashboard  
✅ Real-time telemetry tracking  
✅ AI-powered risk predictions  
✅ Alert management system  
✅ Professional healthcare UI  

Happy coding! 🩺💻
