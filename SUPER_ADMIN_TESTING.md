# Testing the Super Admin Feature

## Quick Test Guide

### Prerequisites
1. Backend server running: `cd server && node index.js`
2. Frontend running: `npm run dev`

---

## Test Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| `superadmin` | (your password) | super_admin | Test admin management |
| `admin` | (your password) | admin | Verify tab is hidden |

---

## Test Checklist

### 1. Login as Regular Admin
- [ ] Login with `admin` account
- [ ] Verify "Manage Admins" tab is **NOT visible**
- [ ] Try to access `/api/admin/admins` directly (should get 403)

### 2. Login as Super Admin
- [ ] Login with `superadmin` account
- [ ] Verify "Manage Admins" tab **IS visible**
- [ ] Click on "Manage Admins" tab
- [ ] Verify admin list loads

### 3. View Admin List
- [ ] Check table shows: Username, Email, Full Name, Role, Status, Created Date
- [ ] Verify "You" badge appears next to `superadmin`
- [ ] Verify role badges are color-coded (Super Admin = red, Admin = blue)
- [ ] Verify status badges show Active/Inactive

### 4. Create New Admin
- [ ] Click "Create Admin" button
- [ ] Modal opens with empty form
- [ ] Fill in:
  - Username: `testadmin`
  - Email: `testadmin@example.com`
  - Full Name: `Test Administrator`
  - Password: `TestPass123!` (click eye icon to verify)
  - Role: Select "Admin"
- [ ] Click "Create Admin"
- [ ] Verify success message
- [ ] Verify new admin appears in list

### 5. Edit Admin
- [ ] Click edit button (pencil icon) on `testadmin`
- [ ] Modal opens with pre-filled data
- [ ] Change Full Name to `Test Admin Updated`
- [ ] Leave password blank (to keep current password)
- [ ] Click "Update Admin"
- [ ] Verify success message
- [ ] Verify changes appear in list

### 6. Toggle Admin Status
- [ ] Click deactivate button (ban icon) on `testadmin`
- [ ] Confirm the action
- [ ] Verify status changes to "Inactive"
- [ ] Click activate button (check icon)
- [ ] Confirm the action
- [ ] Verify status changes to "Active"

### 7. Self-Protection Tests
- [ ] Try to edit your own account (`superadmin`) - should work
- [ ] Try to deactivate your own account - buttons should be **disabled**
- [ ] Try to delete your own account - buttons should be **disabled**

### 8. Delete Admin
- [ ] Click delete button (trash icon) on `testadmin`
- [ ] Confirm deletion
- [ ] Verify admin is removed from list
- [ ] Check that admin was soft-deleted (is_active = 0 in database)

### 9. Role Change
- [ ] Edit `admin` account
- [ ] Change role from "Admin" to "Super Admin"
- [ ] Save changes
- [ ] Logout and login as `admin`
- [ ] Verify "Manage Admins" tab now appears

### 10. Activity Logging
- [ ] Go to "Activity Log" tab
- [ ] Filter by action type or search for "admin"
- [ ] Verify all admin CRUD operations are logged:
  - CREATE admin
  - UPDATE admin
  - ACTIVATE admin
  - DEACTIVATE admin
  - DELETE admin

---

## Expected Behaviors

### ✅ Should Work
- Super admins can see and access "Manage Admins" tab
- Super admins can create new admins with any role
- Super admins can edit any admin except username
- Super admins can toggle status of other admins
- Super admins can delete other admins
- Super admins can edit their own profile
- Password is optional when editing (keeps current if blank)
- All actions are logged to activity log

### ❌ Should NOT Work
- Regular admins cannot see "Manage Admins" tab
- Regular admins get 403 if they try to access endpoints directly
- Super admins cannot delete their own account
- Super admins cannot deactivate their own account
- Passwords shorter than 8 characters are rejected
- Duplicate usernames are rejected
- Invalid email formats are rejected

---

## API Testing (Optional)

If you want to test the API directly using a tool like Postman or curl:

### Get All Admins
```bash
GET http://localhost:3000/api/admin/admins
Headers:
  Authorization: Bearer <super_admin_token>
```

### Create Admin
```bash
POST http://localhost:3000/api/admin/admins
Headers:
  Authorization: Bearer <super_admin_token>
  Content-Type: application/json
Body:
{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "SecurePass123!",
  "full_name": "New Admin",
  "role": "admin"
}
```

### Update Admin
```bash
PUT http://localhost:3000/api/admin/admins/3
Headers:
  Authorization: Bearer <super_admin_token>
  Content-Type: application/json
Body:
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "role": "super_admin"
}
```

### Toggle Admin Status
```bash
PATCH http://localhost:3000/api/admin/admins/3/toggle-status
Headers:
  Authorization: Bearer <super_admin_token>
```

### Delete Admin
```bash
DELETE http://localhost:3000/api/admin/admins/3
Headers:
  Authorization: Bearer <super_admin_token>
```

---

## Database Verification

To verify changes in the database:

```javascript
// Run in server directory
node test_super_admin.js
```

This will show:
- All admin accounts
- Their roles
- Active/inactive status
- Creation dates

---

## Troubleshooting

### Tab Not Showing
- Verify you're logged in as super_admin role
- Check localStorage in browser DevTools: `adminUser.role` should be `"super_admin"`
- Clear browser cache and refresh

### 403 Errors
- Verify JWT token is valid and not expired
- Check that backend middleware `requireSuperAdmin` is working
- Verify user role in database matches what's in JWT

### Modal Not Opening
- Check browser console for JavaScript errors
- Verify React state is updating correctly
- Check that AdminModal component is imported and rendered

### Password Issues
- Ensure password is at least 8 characters
- Check that bcrypt is hashing correctly on backend
- Verify password field type toggles with eye icon

---

## Success Criteria

All tests pass when:
1. ✅ Super admins can see and use the "Manage Admins" tab
2. ✅ Regular admins cannot see or access the feature
3. ✅ All CRUD operations work correctly
4. ✅ Self-protection prevents accidental account deletion
5. ✅ All actions are logged to activity log
6. ✅ No errors in browser console or server logs
7. ✅ UI is responsive and intuitive
8. ✅ Validation works correctly (password length, email format, etc.)

---

**Ready to test!** 🚀
