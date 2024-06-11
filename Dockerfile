# Use the official Node.js image as the base image
FROM node:15-alpine AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Copy the config folder into the dist/src folder
RUN cp -r ./src/config ./dist/src

# Expose the port your Node.js application is listening on
EXPOSE 5005

# Start the Node.js application
CMD ["node", "dist/index.js"]