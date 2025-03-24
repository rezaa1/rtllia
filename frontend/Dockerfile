FROM node:20-alpine as build

WORKDIR /app

# Create package.json if it doesn't exist
RUN echo '{\n  "name": "retell-frontend",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-router-dom": "^6.10.0",\n    "axios": "^1.3.5",\n    "bootstrap": "^5.2.3",\n    "react-bootstrap": "^2.7.4"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "eslintConfig": {\n    "extends": [\n      "react-app",\n      "react-app/jest"\n    ]\n  },\n  "browserslist": {\n    "production": [\n      ">0.2%",\n      "not dead",\n      "not op_mini all"\n    ],\n    "development": [\n      "last 1 chrome version",\n      "last 1 firefox version",\n      "last 1 safari version"\n    ]\n  }\n}' > package.json

# Install react-scripts globally
RUN npm install -g react-scripts

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Create .env file for React
RUN echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
