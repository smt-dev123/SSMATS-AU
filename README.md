# Full Stack Application

A comprehensive full-stack application built with modern technologies including Bun.js backend, React.js web frontend, and Expo React Native mobile app.

## 🚀 Tech Stack

### Backend

- **Bun.js** with **Hono.js** - RESTful API server
- **PostgreSQL** - Database (specify your choice)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Bun Uploads** - File uploads
- **Cors** - Cross-origin resource sharing

### Frontend Web

- **React.js** - React library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Tanstack Table** - Table
- **Tanstack Router** - Routing
- **Zustand** - State management

### Frontend Mobile

- **Expo React Native** - Cross-platform mobile development
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Expo Vector Icons** - Icons
- **AsyncStorage** - Local storage

## 📁 Project Structure

```
project-root/
├── backend/               # Hono.js API server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utility functions
│   ├── uploads/           # File uploads
│   └── package.json
├── admin/                 # React.js web application
│   ├── src/
│   │   ├── pages/         # pages
│   │   ├── components/    # components
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # types
│   └── package.json
├── mobile/                # Expo React Native app
│   ├── app/
│   │   ├── (taps)/        # Tab screens
│   │   ├── components/    # components
│   │   ├── navigation/    # Navigation configuration
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
PORT = 3000
NODE_ENV = "development"
LOG_LEVEL = info
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
BETTER_AUTH_SECRET = SCRETE_KEY
BETTER_AUTH_URL = http://localhost:3000

WS_PORT = 3000
ADMIN_EMAIL = "[EMAIL_ADDRESS]"
ADMIN_PASSWORD = "[PASSWORD]"
ADMIN_NAME = "Super Admin"

```

Start the backend server:

```bash
npm run dev
```

### Frontend Web Setup

```bash
cd frontend-web
npm install
```

Create `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

### Frontend Mobile Setup

```bash
cd frontend-mobile
npm install
```

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Start the Expo development server:

```bash
npx expo start
```

## 🚦 Running the Application

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Web Frontend**: `cd admin && bun dev`
3. **Start Mobile App**: `cd mobile && npx expo start`

### Access Points

- **API Server**: http://localhost:3000
- **Web Application**: http://localhost:5173
- **Mobile App**: Use Expo Go app to scan QR code

## Features

### Core Features

- User authentication (register/login)
- JWT-based authorization
- CRUD operations
- File upload functionality
- Responsive design
- Cross-platform mobile support

## 📦 Deployment

### Backend Deployment

- **Docker**: Dockerfile

### Frontend Web Deployment

- **Docker**: Dockerfile

### Mobile App Deployment

- **Expo Application Services (EAS)**:

```bash
eas build --platform all
eas submit --platform all
```

## 🔧 Scripts

### Backend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
```

### Frontend Web Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Mobile App Scripts

```bash
npx expo start       # Start Expo development server
npx expo build       # Build app
eas build            # Build with EAS
eas submit           # Submit to app stores
```
