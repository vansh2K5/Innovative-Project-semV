const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'superadmin', 'securityadmin'], default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Add comparePassword method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const testCredentials = [
      { email: 'superadmin@ems.com', password: 'super123' },
      { email: 'securityadmin@ems.com', password: 'security123' },
      { email: 'admin@ems.com', password: 'admin123' },
    ];

    for (const cred of testCredentials) {
      console.log(`Testing: ${cred.email}`);
      
      const user = await User.findOne({ email: cred.email.toLowerCase() });
      
      if (!user) {
        console.log('  ❌ User not found\n');
        continue;
      }
      
      console.log(`  Found user: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
      
      const isValid = await user.comparePassword(cred.password);
      console.log(`  Password "${cred.password}": ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);
    }

    await mongoose.connection.close();
    console.log('✅ Test complete');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
