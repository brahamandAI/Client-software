import 'dotenv/config';
import connectDB from '../lib/db';
import User from '../models/User';
import Station from '../models/Station';

async function checkAllUsers() {
  console.log('👥 Checking All Users in Database...\n');
  
  try {
    await connectDB();
    console.log('✅ Database connected\n');

    const users = await User.find({});
    
    console.log('👥 All Users in Database:');
    console.log('='.repeat(60));
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Station ID: ${user.stationId || 'N/A'}`);
      console.log(`   Active: ${user.isActive || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    console.log(`📊 Total Users: ${users.length}`);
    
    // Check by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📈 Users by Role:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAllUsers();
