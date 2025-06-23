# Create User Edge Function

This Edge Function provides a transactional approach to user registration, ensuring that both the auth user and the profile record are created together or not at all.

## Purpose

The function solves a critical issue where user authentication records could be created without corresponding profile data, leading to "orphaned" accounts and login failures.

## Features

- Creates a user in Supabase Auth
- Creates a corresponding profile in the public.users table
- Ensures transactional integrity (if profile creation fails, auth user is deleted)
- Handles proper error reporting
- Supports CORS for cross-origin requests

## Usage

Call this function from your frontend registration flow:

```typescript
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    metadata: {
      full_name: 'John Doe',
      role: 'doctor',
      hospital_id: 'hospital-uuid',
      phone: '9876543210',
      department_id: 'department-uuid',
      employee_id: 'EMP001'
    }
  })
})

const result = await response.json()
```

## Required Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (admin access)

## Security Considerations

- This function uses the service role key which has admin privileges
- It should only be called from trusted client applications
- Input validation is performed to prevent misuse