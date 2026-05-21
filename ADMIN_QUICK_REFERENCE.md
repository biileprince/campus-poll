# Admin Panel Quick Reference Guide

## 🚀 Quick Start

### Access Admin Panel
```
URL: http://localhost:5173/admin
```

## 📊 Admin Dashboard (`/admin`)
- **Total Users**: Count of all registered users
- **Total Polls**: Count of all created polls
- **Total Votes**: Sum of all votes across all polls
- **Total Options**: Count of all poll options
- **Recent Polls**: List of 5 most recent polls

## 👥 User Management (`/admin/users`)

### View Users
- Lists all users in the system
- Pagination: 10 users per page
- Search by email or name in real-time

### Create User
1. Click "+ Add User"
2. Enter email, name, and role
3. Click "Save"

### Edit User
1. Click "Edit" next to user
2. Modify name and/or role
3. Click "Save"

### Delete User
1. Click "Delete" next to user
2. Confirm deletion

### User Columns
| Column | Description |
|--------|-------------|
| Email | User's email address |
| Name | User's full name |
| Role | user or admin |
| Polls | Number of polls created by user |
| Created | Account creation date |

## 📋 Poll Management (`/admin/polls`)

### View All Polls
- Lists all polls in the system
- Pagination: 10 polls per page
- Search by question in real-time

### View Poll Details
1. Click "View" on any poll
2. See vote distribution chart
3. View creator information
4. Check total votes and options

### Reset Poll Votes
1. Click "Reset" on any poll
2. Confirm action
3. All votes reset to 0

### Delete Poll
1. Click "Delete" on any poll
2. Confirm deletion
3. Poll is permanently removed

### Poll Columns
| Column | Description |
|--------|-------------|
| Question | Poll question text |
| Votes | Total number of votes |
| Options | Number of poll options |
| Created By | User who created poll |
| Created | Poll creation date |

## 🔐 User Roles

| Role | Access |
|------|--------|
| user | Cannot access admin panel |
| admin | Full access to admin panel |

## 📡 API Reference

### Get Dashboard Stats
```
GET /api/admin/stats
```

### Users API
```
GET /api/admin/users?page=1&limit=10&search=query
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

### Polls API
```
GET /api/admin/polls?page=1&limit=10&search=query
GET /api/admin/polls/:id
POST /api/admin/polls/:id/reset
DELETE /api/admin/polls/:id
```

## ⚙️ Configuration

### Environment Variables
```bash
# Client
VITE_API_BASE_URL=http://localhost:5000/api

# Server
DATABASE_URL=postgresql://user:password@localhost:5432/db
PORT=5000
```

## 🛠️ Setup Checklist

- [ ] Run Prisma migrations: `npx prisma migrate dev`
- [ ] Start server: `npm start` (from server directory)
- [ ] Start client: `npm run dev` (from client directory)
- [ ] Navigate to http://localhost:5173/admin
- [ ] Create test users
- [ ] Verify all features work

## 📝 Common Tasks

### Create Admin User
1. Go to Users page
2. Click "+ Add User"
3. Set role to "admin"

### View Poll Statistics
1. Go to Polls page
2. Click "View" on desired poll
3. See detailed vote breakdown

### Search Users/Polls
- Type in search box
- Results update in real-time
- Pagination resets to page 1

### Export Data
_Not currently available - can be added in future_

## ⚠️ Important Notes

- Deleting a user will cascade delete their polls
- Resetting votes cannot be undone (no undo button)
- Admin actions are not currently logged
- Search is case-insensitive
- Pagination starts at page 1

## 🐛 Troubleshooting

### Pages not loading
```
✓ Check server is running
✓ Check client is running
✓ Verify VITE_API_BASE_URL
✓ Check browser console for errors
```

### Can't create users
```
✓ Verify email is unique
✓ Check all fields are filled
✓ Check server error logs
```

### Search not working
```
✓ Ensure you've entered search text
✓ Check that data exists
✓ Try clearing search field
```

## 📞 Support

For issues or feature requests, check:
- Server error logs: `server/` directory
- Browser console (F12)
- Network tab for API responses

---

**Version:** 1.0
**Last Updated:** May 2026
