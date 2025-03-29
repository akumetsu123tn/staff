# Lightning Degree API Documentation

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "StrongP@ssw0rd"
}
```

**Response**
```json
{
    "message": "Registration successful. Please check your email to verify your account."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "StrongP@ssw0rd",
    "remember": true
}
```

**Response**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "User",
        "credits": 0
    }
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "john@example.com"
}
```

**Response**
```json
{
    "message": "Password reset link sent to your email"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "password": "NewStrongP@ssw0rd",
    "resetToken": "token-from-email"
}
```

**Response**
```json
{
    "message": "Password reset successful"
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
    "token": "verification-token-from-email"
}
```

**Response**
```json
{
    "message": "Email verified successfully"
}
```

## Social Authentication

### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google login page

### Facebook OAuth
```http
GET /api/auth/facebook
```
Redirects to Facebook login page

## Two-Factor Authentication

### Enable 2FA
```http
POST /api/2fa/enable
Authorization: Bearer <jwt_token>
```

**Response**
```json
{
    "secret": "BASE32SECRET",
    "qrCode": "data:image/png;base64,..."
}
```

### Verify 2FA
```http
POST /api/2fa/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "token": "123456"
}
```

**Response**
```json
{
    "message": "2FA enabled successfully"
}
```

### Validate 2FA Token
```http
POST /api/2fa/validate
Content-Type: application/json

{
    "userId": 1,
    "token": "123456"
}
```

**Response**
```json
{
    "message": "2FA validation successful"
}
```

### Disable 2FA
```http
POST /api/2fa/disable
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "token": "123456"
}
```

**Response**
```json
{
    "message": "2FA disabled successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
    "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
    "message": "Access denied"
}
```

### 404 Not Found
```json
{
    "message": "Resource not found"
}
```

### 500 Server Error
```json
{
    "message": "Server error"
}
```

## Security Features

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **Rate Limiting**
   - 100 requests per 15 minutes per IP

3. **Security Headers**
   - CORS protection
   - XSS protection
   - CSRF protection
   - Content Security Policy
   - HTTP Strict Transport Security

4. **JWT Token**
   - Expires in 24 hours (or 7 days if "remember me" is selected)
   - Contains user ID and role
   - Signed with secure secret

5. **Two-Factor Authentication**
   - TOTP-based (Time-based One-Time Password)
   - Compatible with Google Authenticator and similar apps
   - 30-second token validity
   - Secure QR code generation 