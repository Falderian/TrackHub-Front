FROM node:26-alpine

WORKDIR /app

# Install basic development tools
RUN apk add --no-cache bash openjdk17-jre

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

COPY . .

# Expo Metro Bundler ports
EXPOSE 8081

CMD ["npm", "run", "start"]
