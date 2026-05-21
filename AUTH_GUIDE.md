# Admin Authentication & Authorization Guide

## Overview
The admin panel now includes comprehensive authentication and authorization features to secure the admin section of the Campus Poll application.

## Features Implemented

### 1. **Back to Dashboard Button** ✅
- Added a dedicated "📊 Dashboard" button in the admin sidebar footer
- Quick navigation from any admin page (Users, Polls) back to the dashboard
- Located alongside "Back to App" and "Logout" buttons

### 2. **Client-Side Authentication** ✅
- **Auth Service** (`client/src/services/authService.js`):
  - JWT token management (store, retrieve, clear)
  - Login function with credentials
  - Logout function
  - Token verification
  - Axios interceptor for automatic token attachment
  - Automatic redirect to login on 401 responses

### 3. **Protected Routes** ✅
- **ProtectedRoute Component** (`client/src/Components/ProtectedRoute.jsx`):
  - Validates admin authentication before rendering
  - Redirects to login if token is invalid
  - Shows loading state during verification
  - Protects all admin routes: `/admin`, `/admin/users`, `/admin/polls`

### 4. **Admin Login Page** ✅
- **AdminLogin Page** (`client/src/pages/AdminLogin.jsx`):
  - Clean, user-friendly login interface
  - Email and password input fields
  - Real-time error handling
  - Demo credentials display
  - "Back to Home" link for non-admins
  - Security warning badge

### 5. **Server-Side Authentication** ✅
- **Auth Middleware** (`server/middlewares/authMiddleware.js`):
  - JWT token verification
  - Bearer token extraction from headers
  - 401 error responses for missing/invalid tokens
  - Token generation with 24-hour expiration

- **Admin Controller** (`server/controllers/adminController.js`):
  - `adminLogin` endpoint: POST `/api/admin/login`
  - `verifyAdminToken` endpoint: GET `/api/admin/verify`
  - Demo credentials: username `admin`, password `admin123`

### 6. **Protected API Routes** ✅
- All admin endpoints now require valid JWT token:
  - Dashboard stats: GET `/api/admin/stats`
  - User management: GET/POST/PUT/DELETE `/api/admin/users`
  - Poll management: GET/POST/DELETE `/api/admin/polls`
  - Public endpoints: POST `/api/admin/login`, GET `/api/admin/verify`

### 7. **Logout Functionality** ✅
- Logout button in admin sidebar (red-highlighted on hover)
- Clears token from localStorage
- Redirects to login page
- Icon: 🚪 (Door)

## Login Credentials

### Demo Admin Account
```
Username: admin
Password: admin123
```

**Note**: In production, implement:
- Proper password hashing (bcrypt)
- Database-backed user management
- Role-based access control (RBAC)
- Session management
- Rate limiting on login attempts

## Architecture

### Client-Side Flow
```
User → AdminLogin (no auth required)
         ↓
      Credentials → Server Login Endpoint
         ↓
      JWT Token → localStorage
         ↓
      App.jsx → ProtectedRoute
         ↓
      Token Verification → AdminLayout
         ↓
      Admin Panel ✅
```

### Server-Side Flow
```
Request → /api/admin/* (protected routes)
   ↓
verifyAdminToken Middleware
   ↓
Check Authorization Header
   ↓
Verify JWT Signature & Expiration
   ↓
Valid? → Proceed | Invalid? → 401 Error
```

## Files Modified/Created

### Client
- ✅ `client/src/pages/AdminLogin.jsx` - New login page
- ✅ `client/src/Components/ProtectedRoute.jsx` - New protected route wrapper
- ✅ `client/src/services/authService.js` - New auth service
- ✅ `client/src/pages/AdminLayout.jsx` - Updated with logout button & back button
- ✅ `client/src/App.jsx` - Updated routes with protection

### Server
- ✅ `server/middlewares/authMiddleware.js` - New JWT middleware
- ✅ `server/controllers/adminController.js` - Updated with login/verify endpoints
- ✅ `server/routes/adminRoutes.js` - Updated with auth protection
- ✅ `server/.env` - New environment config with JWT_SECRET
- ✅ `server/package.json` - Added jsonwebtoken dependency

## Environment Variables

Add to `server/.env`:
```
JWT_SECRET=your-secure-jwt-secret-key-change-in-production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Security Best Practices Implemented

1. ✅ **Token-based authentication** - JWT tokens instead of session cookies
2. ✅ **Protected API routes** - Middleware verification on all admin endpoints
3. ✅ **Automatic token refresh** - Client-side verification before accessing pages
4. ✅ **Error handling** - Proper 401 responses and redirects
5. ✅ **CORS configuration** - Origin whitelist in server config
6. ✅ **Rate limiting** - Global rate limiter (via existing middleware)
7. ✅ **Security headers** - Helmet.js for HTTP headers

## Testing the Authentication

### 1. Access Admin Panel
- Navigate to `http://localhost:5173/admin`
- Should redirect to login page if not authenticated

### 2. Login
- Enter credentials: `admin` / `admin123`
- Click "Login to Admin Panel"
- Should redirect to dashboard

### 3. Navigate Admin Pages
- Try visiting `/admin/users` and `/admin/polls`
- All should render with token protection

### 4. Test Token Expiration
- Logout and clear token
- Try accessing `/admin` directly
- Should redirect to login

### 5. Logout
- Click logout button in sidebar
- Should clear token and redirect to login

## Future Enhancements

1. **User Database Integration**
   - Move from hardcoded credentials to database
   - Implement bcrypt password hashing
   - Create admin user management system

2. **Role-Based Access Control (RBAC)**
   - Different permission levels (super-admin, admin, moderator)
   - Grant-based endpoint access
   - Dynamic role management

3. **Session Management**
   - Refresh tokens for extended sessions
   - Token rotation on refresh
   - Session timeout policies

4. **Audit Logging**
   - Log all admin actions
   - Track changes to users/polls
   - Maintain security audit trail

5. **Two-Factor Authentication (2FA)**
   - SMS/Email verification
   - TOTP authenticator support
   - Backup codes

6. **Advanced Security**
   - Rate limiting on login attempts
   - IP whitelisting
   - Account lockout policies
   - Password complexity requirements

## Troubleshooting

### Issue: "Login failed" message
- Check credentials: `admin` / `admin123`
- Verify server is running on port 5000
- Check browser console for API errors

### Issue: Redirected to login after login
- Check if token is stored in localStorage
- Verify JWT_SECRET in `.env` matches server
- Check if server is running

### Issue: "No token provided" error
- Make sure you're logged in
- Check if Authorization header is being sent
- Verify token hasn't expired (24 hours)

## Contact & Support
For issues or questions about the authentication system, please refer to the main README or create an issue in the repository.
