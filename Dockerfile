# Use an official Node.js runtime as the base image
FROM node:18.17.1-alpine3.17

# Set the working directory inside the container
WORKDIR /www/app

# Install necessary depedencies
RUN npm i npm@latest -g

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application source code to the container
COPY . .

# Expose the port on which the application will run (assuming it's 3000)
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]