FROM node

ENV HOME /opt/fake-leancloud-auth

ADD package.json npm-shrinkwrap.json $HOME/

WORKDIR $HOME

RUN npm install && \
    npm prune --production && \
    npm cache clean

ADD . $HOME/

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
