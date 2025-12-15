# Authentication API Documentation

## Register
POST /api/auth/register
Body:
{
  "name": "string",
  "email": "string",
  "password": "string"
}

## Login
POST /api/auth/login
Body:
{
  "email": "string",
  "password": "string"
}

## Headers for protected routes:
Authorization: Bearer <token>

## Protected Routes
GET /api/books
POST /api/books   (Admin only)

Token expiry: 7 days
