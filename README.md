# Commands to run the app

# Start the docker container
docker-compose up -d

# Init the Database
npm run prisma:dev:deploy

# Start the server
npm run start

OR
# Start the server in watch mode
npm run start:dev

# Run the test scenarios
npm run test:e2e