FROM node:latest

RUN apt-get update
RUN apt-get upgrade -y

WORKDIR /opt/inspector
COPY package.json .

RUN npm install

COPY . .
RUN npm run build

EXPOSE 4040

CMD npm start
