# CardioSentinel Remote - Frontend (React SPA)

React 18 Single Page Application for the CardioSentinel Remote patient monitoring platform.

## Overview

- **Framework**: React 18 with React Router v6
- **Authentication**: JWT tokens
- **Styling**: Bootstrap 5 + Custom CSS
- **Charts**: Recharts & Chart.js
- **Forms**: Formik + Yup validation
- **API Client**: Axios with interceptors

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Forms/         # Form components (Login, Patient, etc.)
│   │   └── Admin/         # Admin-specific components
│   ├── pages/             # Route pages (12+ pages)
│   ├── services/          # API service files
│   ├── context/           # Context API (Auth, Data)
│   ├── css/               # Stylesheets
│   ├── App.jsx            # Main routing component
│   └── index.js           # React DOM render
├── public/
│   └── index.html
├── package.json
└── .env.example
```

## Pages (12+)

1. **Home** (`/`) - Dashboard with stats and recent alerts
2. **Login** (`/login`) - Authentication
3. **Project** (`/project`) - About CardioSentinel
4. **Patients** (`/patients`) - Patient list with search/filter
5. **Patient Detail** (`/patients/:id`) - Individual patient profile with AI risk score
6. **Dataset** (`/dataset`) - Telemetry viewer with charts
7. **Pipeline** (`/pipeline`) - AI model explanation
8. **Alerts** (`/alerts`) - Alert management
9. **Dashboard** (`/dashboard`) - Clinician dashboard
10. **Analytics** (`/analytics`) - Charts and reports
11. **Contact** (`/contact`) - Support tickets
12. **Admin** (`/admin`) - Admin panel

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment**:
   - `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

## Running the App

### Development
```bash
npm start
```

Opens at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Key Features

### Authentication
- JWT token-based authentication
- Protected routes using context
- Auto-logout on token expiration

### Patient Management
- View all patients with pagination
- Search and filter patients
- Create/edit patient profiles
- View patient telemetry and alerts

### AI Integration
- Display cardiac risk predictions
- Visual risk gauge (color-coded)
- Risk factor breakdown
- Confidence scores

### Alerts
- View all system alerts
- Filter by status, type, date
- Mark as reviewed/resolved
- Real-time status updates

### Analytics
- Dashboard statistics (tiles)
- Risk distribution pie chart
- Alert trends line chart
- Average telemetry metrics

### Responsive Design
- Mobile-first approach
- Bootstrap 5 grid system
- Responsive tables
- Touch-friendly interfaces

## Components

### Forms
- `LoginForm.jsx` - User authentication
- `PatientForm.jsx` - Create/edit patients
- `TelemetryForm.jsx` - Record vital signs
- `TicketForm.jsx` - Submit support tickets

### Common
- `Navigation.jsx` - Header with navigation
- `MetricsTile.jsx` - KPI display
- `AlertTable.jsx` - Alerts table
- `PatientCard.jsx` - Patient list card
- `RiskGauge.jsx` - AI risk visualization
- `TelemetryChart.jsx` - Vital signs charts

## Services

Each service file handles API calls for a specific domain:

- `authService.js` - Login, registration, profile
- `patientService.js` - Patient CRUD operations
- `telemetryService.js` - Vital signs data
- `alertService.js` - Alert management
- `predictionService.js` - AI predictions
- `ticketService.js` - Support tickets
- `analyticsService.js` - Dashboard data
- `apiClient.js` - Axios instance with JWT interceptors

## Context

### AuthContext
- Manages user authentication state
- Stores token and user data
- Provides login/logout functions
- Auto-redirect on 401 errors

## Styling

### Theme Variables
- Primary: `#0f4c81` (Dark Blue)
- Accent: `#0f766e` (Teal)
- Alerts: Red, Yellow, Green (status colors)
- Font: Manrope (sans-serif), Lora (serif)

### Responsive Breakpoints
- Desktop: > 768px
- Tablet: 768px
- Mobile: < 480px

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `REACT_APP_API_URL`: https://your-backend.render.com

## Development Notes

- Use `.env.example` as template
- Never commit `.env` file
- Always validate forms with Yup
- Use service functions for API calls
- Implement error boundaries
- Add loading states to all async operations
- Use Bootstrap utilities for styling when possible

## Dependencies

See `package.json` for complete list. Key dependencies:

- React 18
- React Router v6
- Axios
- Bootstrap 5 & React-Bootstrap
- Formik & Yup
- Recharts & Chart.js
- date-fns
- React-Toastify (notifications)

## References

- [React Documentation](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [Bootstrap 5](https://getbootstrap.com)
- [Axios Documentation](https://axios-http.com)
- [Formik Documentation](https://formik.org)
