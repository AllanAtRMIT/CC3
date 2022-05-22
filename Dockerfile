FROM node:16
WORKDIR /server
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
copy . .

EXPOSE 3000

CMD ["node", "index.js"]