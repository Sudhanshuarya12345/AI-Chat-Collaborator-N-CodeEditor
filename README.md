# AI Chat Collaborator & Code Editor

A full-stack web application that combines AI-powered chat collaboration with an integrated code editor. Users can chat with AI, collaborate on projects, and execute code in a browser-based environment.

## Features

- **User Authentication**: Secure login and registration with JWT-based authentication
- **AI Chat Integration**: Chat with Google's Generative AI for code assistance and collaboration
- **Project Management**: Create, manage, and organize coding projects
- **Real-time Communication**: Socket.io integration for live updates and collaboration
- **Code Execution**: WebContainer API for running code directly in the browser
- **Syntax Highlighting**: Support for multiple programming languages with code highlighting
- **Redis Caching**: Performance optimization with Redis caching layer

## Tech Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **AI Integration**: Google Generative AI
- **Real-time**: Socket.io
- **Caching**: Redis (IORedis)
- **Code Execution**: WebContainer API
- **Utilities**: Morgan (logging), CORS, Express Validator

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Code Display**: React Syntax Highlighter
- **Markdown**: Markdown-to-JSX
- **Icons**: React Icons, Remixicon

## Project Structure

```
├── backend/
│   ├── controller/          # Route controllers (AI, Project, User)
│   ├── models/              # MongoDB schemas (Chat, Project, User)
│   ├── routes/              # API routes
│   ├── services/            # Business logic (AI, Project, User, Redis)
│   ├── middleware/          # Authentication middleware
│   ├── db/                  # Database connection
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
└── frontend/
    ├── src/
    │   ├── screens/         # Page components (Home, Login, Register, Project)
    │   ├── config/          # Configuration (Axios, Socket.io, WebContainer)
    │   ├── context/         # React Context (User auth state)
    │   ├── routes/          # Route definitions
    │   ├── auth/            # Auth components
    │   ├── assets/          # Images and static files
    │   └── App.jsx          # Root component
    └── vite.config.js       # Vite configuration
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis (optional, for caching features)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_google_generative_ai_key
REDIS_URL=redis://localhost:6379 (optional)
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
# or
node server.js
```
Backend runs on `http://localhost:5000` by default

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` by default

## API Endpoints

### User Routes (`/users`)
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (protected)

### Project Routes (`/projects`)
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### AI Routes (`/ai`)
- `GET /ai/get-result` - Get AI chat response

## Key Features in Detail

### Authentication
Uses JWT tokens stored in cookies with bcrypt password hashing for secure user authentication.

### AI Integration
Leverages Google's Generative AI API for intelligent code suggestions and conversational assistance.

### Real-time Collaboration
Socket.io enables real-time communication between users on the same project.

### Code Execution
WebContainer API allows users to run code (Node.js, HTML/CSS/JS) directly in the browser sandbox.

## Environment Variables

Backend requires these environment variables in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `GOOGLE_AI_API_KEY` - Google Generative AI API key
- `REDIS_URL` - (Optional) Redis connection string for caching
- `PORT` - (Optional) Server port (default: 5000)

## Development

### Code Style
- ESLint configured for both frontend and backend
- Tailwind CSS for styling

### Build for Production

Frontend:
```bash
cd frontend
npm run build
```

## Future Enhancements

- Real-time code editor with live collaboration
- Support for multiple programming languages
- Advanced project templates
- User roles and permissions
- Chat history and conversation management

## License

ISC
