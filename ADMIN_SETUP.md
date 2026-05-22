# Admin Panel Documentation

## Overview
The Campus Poll application now includes a comprehensive admin panel for managing users and polls. The admin interface provides dashboard statistics, user management, and poll management features.

## Features

### 1. Admin Dashboard
**Route:** `/admin`

Displays:
- Total users count
- Total polls count
- Total votes count
- Total options count
- Recent polls list

### 2. User Management
**Route:** `/admin/users`

**Features:**
- View all users with pagination (10 per page)
- Search users by email or name
- Create new users with email, name, and role
- Edit user details (name and role)
- Delete users
- View poll count per user
- Filter by role (user/admin)

**User Roles:**
- `user` - Regular user
- `admin` - Administrator with access to admin panel

### 3. Poll Management
**Route:** `/admin/polls`

**Features:**
- View all polls with pagination (10 per page)
- Search polls by question
- View detailed poll statistics:
  - Total votes
  - Option count
  - Vote distribution per option
  - Poll creator information
- Reset poll votes (sets all option vote counts to 0)
- Delete polls
- View creation date and creator

## API Endpoints

### Dashboard
```
GET /api/admin/stats
Response: { stats: {...}, recentPolls: [...] }
```

### Users Management
```
GET /api/admin/users?page=1&limit=10&search=query
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Polls Management
```
GET /api/admin/polls?page=1&limit=10&search=query
GET /api/admin/polls/:id
POST /api/admin/polls/:id/reset
DELETE /api/admin/polls/:id
```

## Database Schema

### User Model
```
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  polls     Poll[]   // Polls created by this user
}
```

### Poll Model (Updated)
```
model Poll {
  id        String   @id @default(cuid())
  question  String
  voteId    String   @unique @default(cuid())
  resultsId String   @unique @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?  // User ID who created this poll
  user      User?    @relation(fields: [createdBy], references: [id])
  options   Option[]
}
```

## Frontend Components

### AdminLayout
Main admin panel layout with:
- Sidebar navigation
- Main content area
- Responsive design

### AdminDashboard
Statistics display and overview cards

### AdminUsers
User management interface with CRUD operations

### AdminPolls
Poll management interface with detailed statistics

## Services

### adminApi.js
Contains all admin-related API functions:

**User Functions:**
```javascript
getUsers(page, limit, search)
createUser(userData)
updateUser(userId, userData)
deleteUser(userId)
```

**Poll Functions:**
```javascript
getAdminPolls(page, limit, search)
getPollDetailsAdmin(pollId)
deletePollAdmin(pollId)
resetPollVotes(pollId)
```

**Dashboard Functions:**
```javascript
getDashboardStats()
```

## Usage Examples

### Navigate to Admin Panel
```
http://localhost:5173/admin
```

### Create a New User
1. Go to `/admin/users`
2. Click "+ Add User"
3. Fill in email, name, and role
4. Click "Save"

### Manage Polls
1. Go to `/admin/polls`
2. View poll details by clicking "View"
3. Reset votes with "Reset" button
4. Delete polls with "Delete" button

### View Dashboard
1. Go to `/admin`
2. See platform statistics at a glance

## Security Considerations

Current implementation includes:
- Input validation on the backend
- Rate limiting on API endpoints
- Data sanitization
- Error handling

**Recommended Enhancements:**
- Add authentication middleware to protect admin routes
- Implement role-based access control (RBAC)
- Add audit logging for admin actions
- Require password confirmation for destructive actions
- Add JWT or session-based authentication

## Setup Instructions

### 1. Update Database
Run Prisma migration to add User model:
```bash
cd server
npx prisma migrate dev
```

### 2. Start Server
```bash
cd server
npm start
```

### 3. Start Client
```bash
cd client
npm run dev
```

### 4. Access Admin Panel
Navigate to `http://localhost:5173/admin`

## Files Created/Modified

### New Files:
- `server/controllers/adminController.js`
- `server/routes/adminRoutes.js`
- `client/src/services/adminApi.js`
- `client/src/pages/AdminLayout.jsx`
- `client/src/pages/AdminDashboard.jsx`
- `client/src/pages/AdminUsers.jsx`
- `client/src/pages/AdminPolls.jsx`

### Modified Files:
- `server/prisma/schema.prisma` - Added User model
- `server/server.js` - Added admin routes
- `client/src/App.jsx` - Added admin routes

## Troubleshooting

### Admin pages not loading
- Check that server is running on the correct port
- Verify VITE_API_BASE_URL environment variable
- Check browser console for errors

### API errors
- Ensure Prisma migrations are up to date
- Check server logs for detailed error messages
- Verify database connection

### Pagination not working
- Check that page parameter is passed correctly
- Verify limit parameter is within acceptable range

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Admin action audit logs
- [ ] Advanced analytics and reporting
- [ ] Bulk operations (bulk delete, export)
- [ ] User activity tracking
- [ ] Poll analytics charts
- [ ] Email notifications
- [ ] Role management interface
