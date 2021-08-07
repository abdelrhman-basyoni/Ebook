FROM node:15
WORKDIR /server1
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "server.js" ]
EXPOSE 5000
