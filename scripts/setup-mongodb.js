// MongoDB Setup Script
// Run this with: node scripts/setup-mongodb.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'ems-db';

async function setupMongoDB() {
  console.log('🚀 Starting MongoDB setup...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = client.db(DB_NAME);

    // Create collections
    console.log('📦 Creating collections...');
    
    const collections = ['users', 'events', 'analytics'];
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${collectionName} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created unique index on users.email');

    // Events indexes
    await db.collection('events').createIndex({ startDate: 1, endDate: 1 });
    await db.collection('events').createIndex({ createdBy: 1 });
    await db.collection('events').createIndex({ assignedTo: 1 });
    await db.collection('events').createIndex({ status: 1 });
    console.log('✅ Created indexes on events collection');

    // Analytics indexes
    await db.collection('analytics').createIndex({ userId: 1, date: -1 });
    await db.collection('analytics').createIndex({ date: -1 });
    console.log('✅ Created indexes on analytics collection');

    // Create sample admin user
    console.log('\n👤 Creating sample admin user...');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    try {
      await db.collection('users').insertOne({
        email: 'admin@ems.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        department: 'Management',
        position: 'System Administrator',
        joinedDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Created admin user:');
      console.log('   Email: admin@ems.com');
      console.log('   Password: admin123');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Admin user already exists');
      } else {
        throw error;
      }
    }

    // Create sample regular user
    console.log('\n👤 Creating sample regular user...');
    const userPassword = await bcrypt.hash('user123', salt);

    try {
      await db.collection('users').insertOne({
        email: 'user@ems.com',
        password: userPassword,
        name: 'Regular User',
        role: 'user',
        department: 'Engineering',
        position: 'Developer',
        joinedDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Created regular user:');
      console.log('   Email: user@ems.com');
      console.log('   Password: user123');
    } catch (error) {
      if (error.code === 11000) {
        console.log('ℹ️  Regular user already exists');
      } else {
        throw error;
      }
    }

    // Create sample events
    console.log('\n📅 Creating sample events...');
    const adminUser = await db.collection('users').findOne({ email: 'admin@ems.com' });
    
    if (adminUser) {
      const sampleEvents = [
        {
          title: 'Team Meeting',
          description: 'Weekly team sync meeting',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
          type: 'meeting',
          priority: 'high',
          status: 'pending',
          createdBy: adminUser._id,
          assignedTo: [],
          location: 'Conference Room A',
          isAllDay: false,
          reminders: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Project Deadline',
          description: 'Complete Q4 project deliverables',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          type: 'deadline',
          priority: 'high',
          status: 'pending',
          createdBy: adminUser._id,
          assignedTo: [],
          isAllDay: true,
          reminders: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'Code Review',
          description: 'Review pull requests',
          startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
          type: 'task',
          priority: 'medium',
          status: 'pending',
          createdBy: adminUser._id,
          assignedTo: [],
          isAllDay: false,
          reminders: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      try {
        await db.collection('events').insertMany(sampleEvents);
        console.log(`✅ Created ${sampleEvents.length} sample events`);
      } catch (error) {
        console.log('ℹ️  Sample events may already exist');
      }
    }

    console.log('\n✨ MongoDB setup completed successfully!\n');
    console.log('📊 Database Summary:');
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   Collections: ${collections.join(', ')}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@ems.com / admin123');
    console.log('   User:  user@ems.com / user123');
    console.log('\n🚀 You can now start your application with: npm run dev\n');

    await client.close();
  } catch (error) {
    console.error('\n❌ Error setting up MongoDB:', error.message);
    console.error('\n💡 Make sure MongoDB is running:');
    console.error('   Windows: net start MongoDB');
    console.error('   Or manually: mongod --dbpath "C:\\data\\db"');
    process.exit(1);
  }
}

setupMongoDB();
