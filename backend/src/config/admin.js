const { ENV_CONFIG } = require('./constants');

// Admin configuration
const ADMIN_CONFIG = {
  email: ENV_CONFIG.ADMIN_EMAIL,
  password: ENV_CONFIG.ADMIN_PASSWORD,
  name: 'Admin User',
  role: 'ADMIN'
};

// Admin creation function
const createAdminUser = async (prisma, bcrypt) => {
  const existingAdmin = await prisma.user.findFirst({
    where: { email: ADMIN_CONFIG.email }
  });

  if (existingAdmin) {
    return {
      exists: true,
      user: existingAdmin,
      message: 'Admin user already exists'
    };
  }

  const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: ADMIN_CONFIG.email,
      password: hashedPassword,
      name: ADMIN_CONFIG.name,
      role: ADMIN_CONFIG.role
    }
  });

  return {
    exists: false,
    user: adminUser,
    message: 'Admin user created successfully'
  };
};

// Admin validation function
const validateAdminCredentials = async (prisma, bcrypt, email, password) => {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user || user.role !== 'ADMIN') {
    return { valid: false, message: 'Invalid admin credentials' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return { valid: false, message: 'Invalid admin credentials' };
  }

  return { valid: true, user };
};

module.exports = {
  ADMIN_CONFIG,
  createAdminUser,
  validateAdminCredentials
}; 