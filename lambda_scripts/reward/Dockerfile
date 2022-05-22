FROM public.ecr.aws/lambda/nodejs:16
COPY . .
RUN yarn install
CMD [ 'index.handler' ]
