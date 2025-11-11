const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - update if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'superadmin', 'securityadmin'], default: 'user' },
  department: String,
  position: String,
  joinedDate: { type: Date, default: Date.now },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createSampleAdmins() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const superAdminPassword = await bcrypt.hash('super123', salt);
    const securityAdminPassword = await bcrypt.hash('security123', salt);

    // Create Super Admin
    const superAdminExists = await User.findOne({ email: 'superadmin@ems.com' });
    if (superAdminExists) {
      console.log('⚠️  Super Admin already exists');
    } else {
      await User.create({
        email: 'superadmin@ems.com',
        password: superAdminPassword,
        name: 'Super Admin',
        role: 'superadmin',
        department: 'Administration',
        position: 'Super Administrator',
        isActive: true,
      });
      console.log('✅ Super Admin created successfully');
    }

    // Create Security Admin
    const securityAdminExists = await User.findOne({ email: 'securityadmin@ems.com' });
    if (securityAdminExists) {
      console.log('⚠️  Security Admin already exists');
    } else {
      await User.create({
        email: 'securityadmin@ems.com',
        password: securityAdminPassword,
        name: 'Security Admin',
        role: 'securityadmin',
        department: 'Security',
        position: 'Security Administrator',
        isActive: true,
      });
      console.log('✅ Security Admin created successfully');
    }

    console.log('\n📋 Sample Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌟 SUPER ADMIN:');
    console.log('   Email:    superadmin@ems.com');
    console.log('   Password: super123');
    console.log('   Role:     Super Admin');
    console.log('   Access:   Full system access + Security page');
    console.log('\n🛡️  SECURITY ADMIN:');
    console.log('   Email:    securityadmin@ems.com');
    console.log('   Password: security123');
    console.log('   Role:     Security Admin');
    console.log('   Access:   User management (no delete) + Security page');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating sample admins:', error);
    process.exit(1);
  }
}

// Run the script
createSampleAdmins();
