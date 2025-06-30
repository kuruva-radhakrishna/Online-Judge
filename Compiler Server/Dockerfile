FROM node:22-alpine3.18
WORKDIR /app
RUN apk update && apk add --no-cache g++ gcc python3 openjdk17
COPY . /app/ 
RUN npm install
EXPOSE 8000
CMD ["node" , "app.js"]