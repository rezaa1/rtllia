# Retell AI Integration - Docker Deployment

This project contains a containerized application for integrating with Retell AI's voice agent API. The application includes multi-tenancy support, white labeling capabilities, and organization management features.

## Directory Structure

```
docker_deployment/
├── backend/           # Node.js Express backend
│   ├── config/        # Database configuration
│   ├── controllers/   # API controllers
│   ├── middleware/    # Authentication middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── .env           # Environment variables
│   ├── Dockerfile     # Backend container configuration
│   ├── package.json   # Node.js dependencies
│   └── server.js      # Main application file
├── frontend/          # React frontend
│   ├── src/           # React source code
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Application pages
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── App.js       # Main React component
│   │   └── index.js     # Entry point
│   └── Dockerfile     # Frontend container configuration
├── database/          # PostgreSQL database
│   ├── Dockerfile     # Database container configuration
│   └── postgresql_schema.sql  # Database schema
└── docker-compose.yml # Container orchestration
```

## Deployment Instructions

1. Ensure Docker and Docker Compose are installed on your system
2. Update environment variables in `backend/.env` and `docker-compose.yml`
3. Run the application with:

```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api

## Features

- Multi-tenancy with organization isolation
- White labeling with custom domains and branding
- Organization management with user roles
- Integration with Retell AI for voice agents
- PostgreSQL database for data storage

## Environment Variables

Important variables to configure:
- `RETELL_API_KEY`: Your Retell AI API key
- `JWT_SECRET`: Secret for JWT token generation
- `DATABASE_URL`: PostgreSQL connection string

## Data Persistence

The application uses Docker volumes for data persistence:
- `postgres_data`: Database files
- `backend_uploads`: Uploaded files (logos, etc.)
