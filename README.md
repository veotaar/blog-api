# Blog API

This project is a Node.js based back-end API for managing blog posts and comments. Built with express and MongoDB.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose

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

- Bcrypt for Password Hashing and Verification

## Server Settings and Moderation

- Comment creation and signup configuration: The server settings allow the enabling or disabling of comment creation and user signups.
- Profanity middleware: I leveraged [ProfanityAPI](https://www.profanity.dev/) for detecting profanity.
