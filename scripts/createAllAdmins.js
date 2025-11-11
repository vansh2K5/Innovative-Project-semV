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

async function createAllAdmins() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const salt = await bcrypt.genSalt(10);

    const admins = [
      {
        email: 'superadmin@ems.com',
        password: await bcrypt.hash('super123', salt),
        name: 'Super Admin',
        role: 'superadmin',
        department: 'Administration',
        position: 'Super Administrator',
      },
      {
        email: 'securityadmin@ems.com',
        password: await bcrypt.hash('security123', salt),
        name: 'Security Admin',
        role: 'securityadmin',
        department: 'Security',
        position: 'Security Administrator',
      },
      {
        email: 'admin@ems.com',
        password: await bcrypt.hash('admin123', salt),
        name: 'Admin',
        role: 'admin',
        department: 'Administration',
        position: 'Administrator',
      },
    ];

    for (const adminData of admins) {
      const existing = await User.findOne({ email: adminData.email });
      
      if (existing) {
        // Update existing user
        await User.findOneAndUpdate(
          { email: adminData.email },
          { 
            password: adminData.password,
            name: adminData.name,
            role: adminData.role,
            department: adminData.department,
            position: adminData.position,
            isActive: true,
          }
        );
        console.log(`✅ Updated: ${adminData.email} (${adminData.role})`);
      } else {
        // Create new user
        await User.create(adminData);
        console.log(`✅ Created: ${adminData.email} (${adminData.role})`);
      }
    }

    console.log('\n📋 ALL ADMIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌟 SUPER ADMIN:');
    console.log('   Email:    superadmin@ems.com');
    console.log('   Password: super123');
    console.log('   Role:     superadmin');
    console.log('\n🛡️  SECURITY ADMIN:');
    console.log('   Email:    securityadmin@ems.com');
    console.log('   Password: security123');
    console.log('   Role:     securityadmin');
    console.log('\n👤 ADMIN:');
    console.log('   Email:    admin@ems.com');
    console.log('   Password: admin123');
    console.log('   Role:     admin');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAllAdmins();
