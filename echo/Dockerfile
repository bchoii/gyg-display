# FROM alpine:3.20.2
# RUN apk update \
#     && apk add bash \
#     && apk add nodejs \
#     && apk add npm \
#     && apk add docker \
#     && apk add zip \
#     && apk add pdftk

# https://hub.docker.com/_/node
FROM node:24.2.0-alpine3.21

ENV TZ=Asia/Singapore

WORKDIR /work

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENTRYPOINT ["npm"]
CMD ["start"]
