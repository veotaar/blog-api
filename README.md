# Blog API

This project is a Node.js based back-end API for managing my blog posts and comments. Built with express and MongoDB. Front-ends consuming this API:

- CMS: [Repo](https://github.com/veotaar/blog-cms)
- Public blog: [Repo](https://github.com/veotaar/blog-public), [Live](https://blog.ulus.uk)

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- Docker and Github Actions for deployment

## Features

- CRUD operations for blog posts and comments
- JWT-based authentication with role-based access control
- User management through bcrypt password hashing and verification
- Server settings for comment creation and signup management
- Profanity detection middleware

## Authentication and Authorization

- JWT Authentication using Passport.js
- Role-Based Access Control (`admin` and `user` roles)

## User Management

- Bcrypt for password hashing and verification

## Server Settings and Moderation

- Comment creation and signup configuration: The server settings allow the enabling or disabling of comment creation and user signups.
- Profanity middleware: I leveraged [ProfanityAPI](https://www.profanity.dev/) for detecting profanity.
