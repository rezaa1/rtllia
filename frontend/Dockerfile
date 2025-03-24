FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install react-scripts locally instead of globally
RUN npm install react-scripts

# Copy the rest of the application code
COPY . .

# Create .env file for React with dynamic API URL
# This will be replaced with the actual server URL at runtime
RUN echo "REACT_APP_API_URL=" > .env

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
