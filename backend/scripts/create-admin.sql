-- Create admin user with hashed password
-- Password: admin123 (hashed with bcrypt)
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING; 