const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function showAllUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('email name role isActive createdAt');
    
    console.log('📋 ALL USERS IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email:  ${user.email}`);
      console.log(`   Role:   ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTotal users: ${users.length}\n`);

    console.log('🔐 LOGIN CREDENTIALS TO TRY:\n');
    
    const adminUsers = users.filter(u => u.role !== 'user');
    adminUsers.forEach(user => {
      const password = user.role === 'superadmin' ? 'super123' 
                     : user.role === 'securityadmin' ? 'security123'
                     : user.role === 'admin' ? 'admin123'
                     : 'unknown';
      
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${password}`);
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showAllUsers();
