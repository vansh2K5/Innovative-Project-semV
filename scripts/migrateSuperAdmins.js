const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function migrateSuperAdmins() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all superadmin users
    const superAdmins = await User.find({ role: 'superadmin' });
    
    console.log(`Found ${superAdmins.length} Super Admin user(s)\n`);

    if (superAdmins.length > 0) {
      // Update all superadmin to admin
      const result = await User.updateMany(
        { role: 'superadmin' },
        { $set: { role: 'admin' } }
      );

      console.log(`✅ Migrated ${result.modifiedCount} Super Admin(s) to Admin role\n`);

      superAdmins.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) → Now Admin`);
      });
    } else {
      console.log('No Super Admin users found to migrate.');
    }

    console.log('\n✅ Migration complete!');
    
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateSuperAdmins();
