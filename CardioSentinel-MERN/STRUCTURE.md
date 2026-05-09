# Project Structure Summary
# CardioSentinel Remote - MERN Stack Application

```
CardioSentinel-MERN/
│
├── 📁 frontend/                 # React SPA (Port 3000)
│   ├── public/
│   │   └── index.html           # React entry point
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Forms/          # Form components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── PatientForm.jsx
│   │   │   │   └── TelemetryForm.jsx
│   │   │   └── Admin/          # Admin components
│   │   │
│   │   ├── pages/              # Route pages (12+)
│   │   │   ├── Home.jsx        # Dashboard
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProjectPage.jsx
│   │   │   ├── PatientsListPage.jsx
│   │   │   ├── PatientDetailPage.jsx
│   │   │   ├── DatasetPage.jsx
│   │   │   ├── PipelinePage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── ClinicianDashboard.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── AdminPage.jsx
│   │   │
│   │   ├── services/           # API service functions
│   │   │   ├── apiClient.js    # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── patientService.js
│   │   │   ├── telemetryService.js
│   │   │   ├── alertService.js
│   │   │   ├── predictionService.js
│   │   │   ├── ticketService.js
│   │   │   └── analyticsService.js
│   │   │
│   │   ├── context/            # React Context API
│   │   │   ├── AuthContext.jsx
│   │   │   └── DataContext.jsx
│   │   │
│   │   ├── css/                # Stylesheets
│   │   │   └── style.css       # Main styling
│   │   │
│   │   ├── App.jsx             # Main App component
│   │   └── index.js            # React DOM render
│   │
│   ├── package.json            # Frontend dependencies
│   ├── .env.example            # Environment template
│   └── README.md               # Frontend documentation
│
├── 📁 backend/                  # Express API (Port 5000)
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js             # User model
│   │   ├── Patient.js          # Patient model
│   │   ├── Telemetry.js        # Telemetry model
│   │   ├── Alert.js            # Alert model
│   │   └── Ticket.js           # Ticket model
│   │
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── telemetryController.js
│   │   ├── alertController.js
│   │   ├── predictionController.js
│   │   ├── ticketController.js
│   │   └── analyticsController.js
│   │
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── telemetryRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── analyticsRoutes.js
│   │
│   ├── middleware/             # Middleware
│   │   ├── authMiddleware.js   # JWT verification
│   │   ├── roleMiddleware.js   # RBAC
│   │   └── errorHandler.js     # Error handling
│   │
│   ├── config/                 # Configuration
│   │   └── database.js         # MongoDB connection
│   │
│   ├── utils/                  # Utility functions
│   │   └── aiServiceClient.js  # AI service calls
│   │
│   ├── server.js               # Express entry point
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment template
│   └── README.md               # Backend documentation
│
├── 📁 ai-service/              # Flask AI Microservice (Port 8000)
│   ├── model/                  # ML model files
│   │   ├── cardiac_model.pkl   # Trained model
│   │   ├── scaler.pkl          # Feature scaler
│   │   └── feature_columns.json # Feature metadata
│   │
│   ├── app.py                  # Flask server
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Container config
│   ├── .env.example            # Environment template
│   └── README.md               # AI service documentation
│
├── 📁 report/                   # Documentation & Reports
│   ├── ProjectReport.md        # Main project report (13+ pages)
│   ├── APIDocumentation.md     # API endpoints documentation
│   ├── Deployment.md           # Deployment guide
│   ├── Screenshots/            # App screenshots
│   └── Architecture.md         # System architecture
│
├── 📄 README.md                # Main project README
├── 📄 QUICKSTART.md            # Quick start guide
├── 📄 INTEGRATION_GUIDE.md     # AI model integration
├── 📄 STRUCTURE.md             # This file
└── 📄 .gitignore              # Git ignore rules
```

## 🎯 Key Directories Explained

### Frontend (`frontend/`)
- **Components**: Reusable React UI components
- **Pages**: Full page components for each route
- **Services**: API calls and business logic
- **Context**: Global state management
- **CSS**: Styling (Bootstrap + custom)

### Backend (`backend/`)
- **Models**: Database schema definitions
- **Controllers**: Request handlers and business logic
- **Routes**: API endpoint definitions
- **Middleware**: Request processing (auth, validation)
- **Config**: Database and app configuration
- **Utils**: Helper functions

### AI Service (`ai-service/`)
- **model/**: Trained ML model files (pickle format)
- **app.py**: Flask REST API server
- **requirements.txt**: Python package dependencies
- **Dockerfile**: Container configuration for deployment

### Report (`report/`)
- Main project documentation
- API specifications
- Deployment instructions
- Architecture diagrams
- Screenshots and evidence

## 📊 Database Collections

```
MongoDB (cardiosentinel)
├── users              # User accounts (clinicians, admins, nurses)
├── patients           # Patient profiles with clinical data
├── telemetry          # Real-time vital signs readings
├── alerts             # Generated alerts from AI
└── tickets            # Support tickets from users
```

## 🔌 API Routes Summary

```
Authentication
├── POST   /api/auth/register
├── POST   /api/auth/login
├── POST   /api/auth/logout
└── GET    /api/auth/me

Patients
├── GET    /api/patients
├── POST   /api/patients
├── GET    /api/patients/:id
├── PUT    /api/patients/:id
└── DELETE /api/patients/:id

Telemetry
├── GET    /api/telemetry
├── POST   /api/telemetry          (triggers AI)
├── GET    /api/telemetry/:patientId
└── GET    /api/telemetry/stats/:patientId

Alerts
├── GET    /api/alerts
├── POST   /api/alerts
├── GET    /api/alerts/:id
└── PUT    /api/alerts/:id

Predictions
├── POST   /api/predictions/predict
└── GET    /api/predictions/history/:patientId

Analytics
├── GET    /api/analytics/dashboard
├── GET    /api/analytics/risk-distribution
├── GET    /api/analytics/alert-trends
└── GET    /api/analytics/telemetry-avg

Tickets
├── GET    /api/tickets
├── POST   /api/tickets
├── GET    /api/tickets/:id
└── PUT    /api/tickets/:id
```

## 🌐 Frontend Routes (Pages)

```
Home
├── /                          Dashboard (home)
├── /login                     Login page
├── /project                   About project
│
Patients
├── /patients                  Patients list
└── /patients/:id              Patient detail (with risk gauge)

Data & Analytics
├── /dataset                   Telemetry viewer
├── /pipeline                  ML pipeline explanation
├── /alerts                    Alert management
├── /analytics                 Analytics & charts
│
Management
├── /dashboard                 Clinician dashboard
├── /contact                   Support tickets
└── /admin                     Admin panel
```

## 🔄 Data Flow

```
Frontend Input
    ↓
React Component (Form)
    ↓
API Service (Axios)
    ↓
Backend Route
    ↓
Controller (Business Logic)
    ↓
Model (MongoDB)
    ↓
[If Telemetry] → AI Service Call
    ↓
Response → Frontend State
    ↓
Component Re-render
```

## 🚀 Deployment Architecture

```
Vercel (Frontend)
↓ HTTPS
├─→ Backend API
│   ├─→ MongoDB Atlas
│   └─→ Render (Backend)
│       ├─→ AI Service (Flask)
│       │   └─→ Render/Railway
│       └─→ Trained ML Models
```

## 📦 Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 18 | SPA with Router v6 |
| | Axios | HTTP client |
| | Bootstrap 5 | Responsive UI framework |
| | Recharts | Data visualization |
| **Backend** | Node.js | Runtime |
| | Express | Web framework |
| | MongoDB | NoSQL database |
| | Mongoose | ODM library |
| | JWT | Authentication |
| | bcryptjs | Password hashing |
| **AI** | Python | Language |
| | Flask | Web framework |
| | scikit-learn | ML models |
| | joblib | Model serialization |
| **Deployment** | Vercel | Frontend hosting |
| | Render | Backend + AI hosting |
| | MongoDB Atlas | Database hosting |

## 🔐 Authentication Flow

```
User → Login Form
    ↓
POST /api/auth/login
    ↓
Backend: Hash password, verify
    ↓
Generate JWT Token
    ↓
Return { token, user }
    ↓
Frontend: Store in localStorage
    ↓
Include in Authorization header
    ↓
Protected Routes Verified
```

## 📋 File Statistics

| Area | Files | Purpose |
|------|-------|---------|
| Frontend | ~20 | Components, pages, services |
| Backend | ~15 | Models, routes, controllers |
| AI Service | 4 | Flask app + models |
| Config | 6 | .env, package.json, etc |
| Documentation | 5+ | README, guides, reports |
| **Total** | **60+** | Complete application |

## ✅ Development Checklist

- [ ] Backend structure created
- [ ] Frontend structure created
- [ ] AI service scaffolding done
- [ ] Database models defined
- [ ] API routes planned
- [ ] React pages planned
- [ ] Services/API clients created
- [ ] Context providers set up
- [ ] Styling configured
- [ ] Authentication implemented
- [ ] AI integration complete
- [ ] Testing done
- [ ] Deployment configured
- [ ] Documentation written

## 📚 Documentation Files

```
README.md                 # Main project overview
QUICKSTART.md            # Quick start guide (15 min)
INTEGRATION_GUIDE.md     # AI model integration
STRUCTURE.md             # This file - project layout

Backend/
└── README.md            # Backend setup & API

Frontend/
└── README.md            # Frontend setup & components

ai-service/
└── README.md            # AI service setup & model

report/
├── ProjectReport.md     # Main report (13+ pages)
├── APIDocumentation.md  # Complete API docs
├── Deployment.md        # Deployment instructions
└── Architecture.md      # System design
```

## 🎯 Next Steps

1. **Setup**: Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Integrate Models**: Follow [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. **Deploy**: Follow `report/Deployment.md`
4. **Document**: Write main project report

---

**Status**: Project structure ready for development  
**Last Updated**: May 8, 2024
