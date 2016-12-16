FROM node:6-alpine

MAINTAINER Jiayu Liu <etareduce@gmail.com>

RUN addgroup -g 998 -S fake-leancloud \
    && adduser -D -u 998 -S -G fake-leancloud fake-leancloud

# see https://github.com/tianon/gosu
ENV GOSU_VERSION 1.9

RUN set -x \
    && apk add --no-cache --virtual .gosu-deps \
        dpkg \
        gnupg \
        openssl \
    && dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')" \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch" \
    && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc" \
    && export GNUPGHOME="$(mktemp -d)" \
    && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    && rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true \
    && apk del .gosu-deps

ENV WORKDIR /opt/fake-leancloud-auth

WORKDIR $WORKDIR

ADD package.json yarn.lock $WORKDIR/

RUN npm install -g yarn && yarn

ADD . $WORKDIR/

RUN npm run build && yarn cache clean

EXPOSE 3000

ENV NODE_ENV production
ENV MONGO_URL mongodb://mongo:27017/local

CMD ["gosu", "fake-leancloud", "npm", "run", "start:prod"]
