# CardioSentinel Remote - Backend API

Node.js + Express REST API for the CardioSentinel Remote patient monitoring platform.

## Overview

- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Flask microservice for cardiac risk prediction

## Project Structure

```
backend/
├── models/           # Mongoose schemas (User, Patient, Telemetry, Alert, Ticket)
├── controllers/      # Business logic for each route
├── routes/          # API endpoint definitions
├── middleware/      # JWT auth, RBAC, error handling
├── config/          # Database configuration
├── utils/           # Helper functions, AI client
├── server.js        # Express server entry point
├── package.json     # Dependencies
└── .env.example     # Environment variables template
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong secret key for token signing
   - `AI_SERVICE_URL`: URL where the Flask AI service is running

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000).

## Database

### MongoDB Collections

1. **Users** - Clinicians, nurses, admins
2. **Patients** - Patient profiles with clinical baseline data
3. **Telemetry** - Real-time vital signs readings
4. **Alerts** - Generated alerts from AI predictions
5. **Tickets** - Support tickets from users

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /logout` - Logout
- `GET /me` - Get current user profile

### Patients (`/api/patients`)
- `GET /` - List all patients (paginated)
- `POST /` - Create new patient
- `GET /:id` - Get patient details
- `PUT /:id` - Update patient
- `DELETE /:id` - Delete patient (admin only)
- `GET /:id/alerts` - Patient alert history
- `GET /:id/telemetry` - Patient telemetry history

### Telemetry (`/api/telemetry`)
- `GET /` - List telemetry readings
- `POST /` - Record new reading (triggers AI prediction)
- `GET /:patientId` - Patient telemetry history
- `GET /stats/:patientId` - Telemetry statistics

### Alerts (`/api/alerts`)
- `GET /` - List all alerts (filterable)
- `POST /` - Create alert manually
- `GET /:id` - Get alert details
- `PUT /:id` - Update alert status

### Predictions (`/api/predictions`)
- `POST /predict` - Run AI prediction
- `GET /history/:patientId` - Prediction history

### Analytics (`/api/analytics`)
- `GET /dashboard` - Dashboard statistics
- `GET /risk-distribution` - Risk level breakdown
- `GET /alert-trends` - Alert trends

## Authentication

All protected routes require a JWT token in the Authorization header:

```javascript
Authorization: Bearer <token>
```

The token is obtained by logging in at `POST /api/auth/login`.

## AI Service Integration

The backend makes calls to the Flask AI microservice at `AI_SERVICE_URL` to:
- Predict cardiac risk for new telemetry readings
- Generate alerts based on predictions

The prediction endpoint expects features like:
```json
{
  "cp": 3,
  "trestbps": 140,
  "chol": 250,
  ...
}
```

And returns:
```json
{
  "riskScore": 0.75,
  "riskLevel": "high",
  "prediction": 1,
  "confidence": 0.85
}
```

## Error Handling

All errors return appropriate HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Development Notes

- Use `.env.example` as a template
- Never commit `.env` file
- Test authentication flows thoroughly
- Always validate input data
- Document new endpoints in this README

## Deployment

See [Deployment.md](../report/Deployment.md) for deployment instructions to Render.
