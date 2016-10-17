FROM node:6

MAINTAINER Jiayu Liu <etareduce@gmail.com>

RUN npm install -g yarn

ENV HOME /opt/fake-leancloud-auth

ADD package.json yarn.lock $HOME/

WORKDIR $HOME

RUN yarn

ADD . $HOME/

RUN npm build && \
    npm prune --production && \
    yarn cache clean && \
    npm uninstall -g yarn && \
    npm cache clean

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]
