FROM node:20.17.0 AS builder

ADD . /build

WORKDIR /build

ENV NODE_OPTIONS --max_old_space_size=8192

RUN cp .env .env

RUN npm install && npm run build && echo ${commit:-unknown} > /build/dist/.commit

FROM nginx:1-alpine AS deploy

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /build/dist ./dist

CMD ["nginx"]
