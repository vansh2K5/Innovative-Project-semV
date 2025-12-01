// MongoDB Atlas Setup Script
// Run with: node scripts/setup-atlas.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable not set');
  process.exit(1);
}

async function setupMongoDB() {
  console.log('🚀 Starting MongoDB Atlas setup...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    const db = mongoose.connection;

    // Create collections if they don't exist
    console.log('📦 Creating collections...');
    
    const collections = ['users', 'events', 'analytics'];
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).stats();
        console.log(`ℹ️  Collection ${collectionName} already exists`);
      } catch (error) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
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
    console.log('\n👤 Creating sample users...');
    const salt = await bcrypt.genSalt(10);
    
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', salt);
    try {
      await db.collection('users').insertOne({
        email: 'admin@ems.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        department: 'Management',
        position: 'System Administrator',
        joinedDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
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

    // Regular user
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
        lastLogin: null,
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

    console.log('\n✅ MongoDB Atlas setup complete!');
    console.log('\n🎉 You can now login with:');
    console.log('   Admin: admin@ems.com / admin123');
    console.log('   User: user@ems.com / user123');

  } catch (error) {
    console.error('❌ Error setting up MongoDB Atlas:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

setupMongoDB();
