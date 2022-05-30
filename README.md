# TeamWallBackend
[HexSchool](https://www.hexschool.com/) node.js live course teamwork practice.

## Environment
Node.js: v14.19.1

## Quick Start

Install packages:

```sh
npm install
```
Run Service:

```sh
npm start
```

Run with hot reload (nodemon):

```sh
npm run dev
```

Run development mode:

```sh
npm start:dev
```

Run production mode:

```sh
npm start:prod
```

Generate Swagger Docs (use Swagger-Autogen):

```sh
npm run swagger
```

## Features

- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using [passport](http://www.passportjs.org) and [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **Validation**: request data validation using [express-validator](https://github.com/express-validator/express-validator)
- **Error handling**: centralized error handling mechanism
- **API documentation**: with [swagger-autogen](https://github.com/davibaltar/swagger-autogen) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- **Dependency management**: with [Npm](https://www.npmjs.com/)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv)
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **WebSocket**: Realtime chat using [socket.io](https://socket.io/)
- **File Upload**: upload files with [Multer](https://github.com/expressjs/multer) and upload images to [imgur](https://imgur.com/) using [axios](https://github.com/axios/axios)
- **Mail Service**: send emails using [nodemailer](https://github.com/nodemailer/nodemailer)

## Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# mongodb
DATABASE_COMPASS=
DATABASE_PASSWORD=
# upload images to imgur
IMGUR_ACCESS_TOKEN=
IMGUR_ACCESS_ALBUM=
# jwt secret key
JWT_SECRET=
# jwt token efficient days
JWT_EXPIRES_DAY=
# email service can set with other services or using SMTP server
GMAIL_USERNAME=
GMAIL_PASSWORD=
GOOGLE_REFRESH_TOKEN=
# sign in with google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# sign in with facebook
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
# sign in with discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```
