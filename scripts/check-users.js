const mongoose = require('mongoose');
const User = require('./models/User');
const Station = require('./models/Station');

async function checkUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/railway_amenities');
    console.log('✅ Connected to database');

    // Get all users
    const users = await User.find({}).populate('stationId', 'name');
    console.log(`\n📊 Total users found: ${users.length}\n`);

    // Check each user
    for (const user of users) {
      console.log(`👤 User: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Station: ${user.stationId ? user.stationId.name : 'None'}`);
      console.log(`   Password Hash: ${user.passwordHash ? '✅ Set' : '❌ Missing'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    }

    // Check for common issues
    console.log('\n🔍 Checking for common issues:');
    
    const usersWithoutPassword = users.filter(u => !u.passwordHash);
    if (usersWithoutPassword.length > 0) {
      console.log(`❌ ${usersWithoutPassword.length} users without password hash`);
    }

    const usersWithoutStation = users.filter(u => (u.role === 'StationManager' || u.role === 'Staff') && !u.stationId);
    if (usersWithoutStation.length > 0) {
      console.log(`❌ ${usersWithoutStation.length} users without station assignment`);
    }

    const duplicateEmails = users.filter((u, i) => users.findIndex(u2 => u2.email === u.email) !== i);
    if (duplicateEmails.length > 0) {
      console.log(`❌ ${duplicateEmails.length} duplicate emails found`);
    }

    console.log('\n✅ User check completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    process.exit(1);
  }
}

checkUsers();
