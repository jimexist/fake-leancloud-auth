FROM node:6

MAINTAINER Jiayu Liu <etareduce@gmail.com>

ENV HOME /opt/fake-leancloud-auth

WORKDIR $HOME

ADD package.json yarn.lock $HOME/

RUN npm install yarn && ./node_modules/.bin/yarn

ADD . $HOME/

RUN npm build && \
    npm prune --production && \
    npm cache clean

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

