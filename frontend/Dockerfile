FROM node:20-alpine as build

WORKDIR /app

# Create package.json if it doesn't exist

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
