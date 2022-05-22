FROM node:16
WORKDIR /server
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

ENV AWS_ACCESS_KEY_ID=#access
ENV AWS_SECRET_ACCESS_KEY=$secret

EXPOSE 3000
EXPOSE 80

CMD ["node", "index.js"]