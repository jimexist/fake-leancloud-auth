FROM node

ENV HOME /opt/fake-leancloud-auth

ADD package.json npm-shrinkwrap.json $HOME/

WORKDIR $HOME

RUN npm install

ADD . $HOME/

RUN npm build && \
    npm prune --production && \
    npm cache clean

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]
