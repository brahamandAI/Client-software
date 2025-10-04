import 'dotenv/config';
import connectDB from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function checkUser() {
  console.log('🔍 Checking SuperAdmin user...\n');
  
  try {
    await connectDB();
    console.log('✅ Database connected\n');

    // Find the SuperAdmin user
    const user = await User.findOne({ email: 'admin@railway.com' });
    
    if (!user) {
      console.log('❌ SuperAdmin user not found!');
      return;
    }

    console.log('👤 User found:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password Hash: ${user.passwordHash}`);
    console.log(`  Created: ${user.createdAt}`);

    // Test password
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
    
    console.log(`\n🔐 Password Test:`);
    console.log(`  Testing password: ${testPassword}`);
    console.log(`  Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);

    if (!isPasswordValid) {
      console.log('\n🔧 Fixing password...');
      const newPasswordHash = await bcrypt.hash(testPassword, 12);
      await User.findByIdAndUpdate(user._id, { passwordHash: newPasswordHash });
      console.log('✅ Password updated successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUser();
