const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

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

async function resetPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const salt = await bcrypt.genSalt(10);

    // Reset Super Admin password
    const superAdminPassword = await bcrypt.hash('super123', salt);
    const superAdmin = await User.findOneAndUpdate(
      { email: 'superadmin@ems.com' },
      { password: superAdminPassword },
      { new: true }
    );
    
    if (superAdmin) {
      console.log('✅ Super Admin password reset');
      console.log('   Email:', superAdmin.email);
      console.log('   Role:', superAdmin.role);
    } else {
      console.log('⚠️  Super Admin not found, creating...');
      await User.create({
        email: 'superadmin@ems.com',
        password: superAdminPassword,
        name: 'Super Admin',
        role: 'superadmin',
        isActive: true,
      });
      console.log('✅ Super Admin created');
    }

    // Reset Security Admin password
    const securityAdminPassword = await bcrypt.hash('security123', salt);
    const securityAdmin = await User.findOneAndUpdate(
      { email: 'securityadmin@ems.com' },
      { password: securityAdminPassword },
      { new: true }
    );
    
    if (securityAdmin) {
      console.log('✅ Security Admin password reset');
      console.log('   Email:', securityAdmin.email);
      console.log('   Role:', securityAdmin.role);
    } else {
      console.log('⚠️  Security Admin not found, creating...');
      await User.create({
        email: 'securityadmin@ems.com',
        password: securityAdminPassword,
        name: 'Security Admin',
        role: 'securityadmin',
        isActive: true,
      });
      console.log('✅ Security Admin created');
    }

    // Reset Regular Admin password
    const adminPassword = await bcrypt.hash('admin123', salt);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@ems.com' },
      { password: adminPassword },
      { new: true }
    );
    
    if (admin) {
      console.log('✅ Admin password reset');
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
    }

    console.log('\n📋 VERIFIED CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌟 SUPER ADMIN:');
    console.log('   Email:    superadmin@ems.com');
    console.log('   Password: super123');
    console.log('\n🛡️  SECURITY ADMIN:');
    console.log('   Email:    securityadmin@ems.com');
    console.log('   Password: security123');
    console.log('\n👤 ADMIN:');
    console.log('   Email:    admin@ems.com');
    console.log('   Password: admin123');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPasswords();
