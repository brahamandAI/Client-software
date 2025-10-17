import 'dotenv/config';
import connectDB from '../lib/db';
import User from '../models/User';

/**
 * Script to fix existing users - set isActive: true for all users
 * Usage: tsx scripts/fix-user-active-status.ts
 */

async function fixUserActiveStatus() {
  try {
    console.log('🔧 Fixing user active status...\n');
    
    await connectDB();
    console.log('✅ Connected to database\n');

    // Update all users without isActive field
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log('');

    // Show all users with their status
    const users = await User.find({}).select('name email role isActive');
    
    console.log('📋 All Users:');
    console.log('─'.repeat(80));
    users.forEach((user) => {
      const status = user.isActive ? '✅ Active' : '❌ Inactive';
      console.log(`${status} | ${user.name.padEnd(25)} | ${user.email.padEnd(30)} | ${user.role}`);
    });
    console.log('─'.repeat(80));
    console.log('');
    console.log('✨ Done! All users are now active by default.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserActiveStatus();

