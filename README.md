# Authentication API

A secure RESTful API for user authentication and password management built with Node.js, Express, and MongoDB.

## Features

- User registration and login
- JWT-based authentication
- Password reset functionality
- Session management
- Token blacklisting
- Rate limiting
- CORS support
- MongoDB integration
- Google OAuth2 integration
- YouTube API integration

## API Base URL

- Production: `https://auth-tkpm.vercel.app/api`
- Development: `http://localhost:3000/api`

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI_PROD=https://auth-tkpm.vercel.app/api/youtube/auth/google/callback
GOOGLE_REDIRECT_URI_DEV=http://localhost:3000/api/youtube/auth/google/callback
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

### Password Reset

#### Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "token": "reset-token-from-email",
    "newPassword": "your-new-password"
}
```

### Google OAuth2

#### Google Login
```http
GET /api/youtube/auth/google
```

#### Google Callback
```http
GET /api/youtube/auth/google/callback
```

#### Check Authentication Status
```http
GET /api/youtube/auth/status
Authorization: Bearer <your-jwt-token>
```

## Response Examples

### Successful Registration
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "user-id",
        "email": "user@example.com"
    }
}
```

### Successful Login
```json
{
    "message": "Login successful",
    "token": "your-jwt-token",
    "user": {
        "id": "user-id",
        "email": "user@example.com"
    }
}
```

### User Profile
```json
{
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2024-03-14T12:00:00.000Z",
    "lastLogin": "2024-03-14T12:00:00.000Z"
}
```

## Deployment

The API is deployed on Vercel and can be accessed at:
- Production URL: `https://auth-tkpm.vercel.app/api`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port number | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT | Yes |
| NODE_ENV | Environment (development/production) | Yes |
| GOOGLE_CLIENT_ID | Google OAuth2 client ID | Yes |
| GOOGLE_CLIENT_SECRET | Google OAuth2 client secret | Yes |
| GOOGLE_REDIRECT_URI_PROD | Production Google callback URL | Yes |
| GOOGLE_REDIRECT_URI_DEV | Development Google callback URL | Yes |

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication
3. **Token Blacklisting**: Invalidated tokens are blacklisted
4. **Rate Limiting**: Prevents brute force attacks
5. **CORS Protection**: Configurable cross-origin resource sharing
6. **Environment Variables**: Sensitive data is stored in environment variables

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Development

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.js       # Application entry point
```

### Available Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with hot reload
- `npm test`: Run the test suite
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 