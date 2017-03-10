# Fake Leancloud Auth
[![Build Status](https://travis-ci.org/Jimexist/fake-leancloud-auth.svg?branch=master)](https://travis-ci.org/Jimexist/fake-leancloud-auth) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A fake Leancloud auth backend for integration testing purpose. **Note that this is not an official repo.**

[中文介绍文档 / Introduction in Chinese](http://www.jiayul.me/tutorial/2016/08/08/fake-leancloud-auth-a-node-based-api-server-example.html)

## Why

When you use Leancloud and want to test against its API for authentication relation functionalities, this is the repo that you want. The purpose of this repo is to bring up a backend that mimics the real Leancloud as close as possible, yet only include minimal features of authentication modules.

## Dependency

This repo uses MongoDB for session and data storage. You should have your MongoDB server up and listening at `localhost:27017` for connections.

## Usage

There are two ways to run this module

### Docker image

If possible, try to use `docker-compose` to setup both MongoDB and this repo. Below is the steps for manual docker container setup. You might want to consider using data volumes if you want to persist MongoDB data - see related docs for details.

```sh
docker run -d --name mongo mongo
docker run -d \
  --name fake-leancloud-auth \
  --link mongo \
  -p 3000:3000 \
  jimexist/fake-leancloud-auth
curl -v localhost:3000/version
```

### Local run

Assuming your MongoDB runs locally, then just do:

```sh
npm install
npm start
```
