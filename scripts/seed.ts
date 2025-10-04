import 'dotenv/config';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '../models/User';
import Station from '../models/Station';
import AmenityType from '../models/AmenityType';
import StationAmenity from '../models/StationAmenity';
import Issue from '../models/Issue';
import Inspection from '../models/Inspection';
import Report from '../models/Report';
import Config from '../models/Config';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Station.deleteMany({});
    await AmenityType.deleteMany({});
    await StationAmenity.deleteMany({});
    await Issue.deleteMany({});
    await Inspection.deleteMany({});
    await Report.deleteMany({});
    await Config.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create amenity types
    const amenityTypes = await AmenityType.insertMany([
      { key: 'water_booth', label: 'Water Booth' },
      { key: 'toilet', label: 'Toilet' },
      { key: 'seating', label: 'Seating' },
      { key: 'lighting', label: 'Lighting' },
      { key: 'fan', label: 'Fan' },
      { key: 'dustbin', label: 'Dustbin' },
    ]);
    console.log('✅ Created amenity types');

    // Create stations
    const stations = await Station.insertMany([
      {
        name: 'Central Railway Station',
        code: 'CST',
        region: 'Mumbai',
        address: 'Chhatrapati Shivaji Terminus, Mumbai, Maharashtra 400001',
        geoLat: 18.9441,
        geoLng: 72.8359,
      },
      {
        name: 'East Junction Station',
        code: 'EJS',
        region: 'Delhi',
        address: 'East Junction, New Delhi, Delhi 110001',
        geoLat: 28.6139,
        geoLng: 77.2090,
      },
      {
        name: 'West Terminal Station',
        code: 'WTS',
        region: 'Bangalore',
        address: 'West Terminal, Bangalore, Karnataka 560001',
        geoLat: 12.9716,
        geoLng: 77.5946,
      },
    ]);
    console.log('✅ Created stations');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const users = await User.insertMany([
      {
        name: 'Super Admin',
        email: 'admin@railway.com',
        passwordHash,
        role: 'SuperAdmin',
      },
      {
        name: 'Station Manager - CST',
        email: 'manager.cst@railway.com',
        passwordHash,
        role: 'StationManager',
        stationId: stations[0]._id,
      },
      {
        name: 'Station Manager - EJS',
        email: 'manager.ejs@railway.com',
        passwordHash,
        role: 'StationManager',
        stationId: stations[1]._id,
      },
      {
        name: 'Staff Member - CST',
        email: 'staff.cst@railway.com',
        passwordHash,
        role: 'Staff',
        stationId: stations[0]._id,
      },
      {
        name: 'Staff Member - EJS',
        email: 'staff.ejs@railway.com',
        passwordHash,
        role: 'Staff',
        stationId: stations[1]._id,
      },
      {
        name: 'Public User',
        email: 'public@example.com',
        passwordHash,
        role: 'Public',
      },
    ]);
    console.log('✅ Created users');

    // Create station amenities
    const stationAmenities = [];
    
    // CST amenities
    for (let i = 0; i < 4; i++) {
      stationAmenities.push({
        stationId: stations[0]._id,
        amenityTypeId: amenityTypes[i]._id,
        locationDescription: `Platform ${i + 1}, ${amenityTypes[i].label}`,
        status: i === 2 ? 'needs_maintenance' : 'ok',
        lastInspectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        notes: i === 2 ? 'Requires maintenance - reported by staff' : '',
        photos: [],
      });
    }

    // EJS amenities
    for (let i = 0; i < 3; i++) {
      stationAmenities.push({
        stationId: stations[1]._id,
        amenityTypeId: amenityTypes[i + 1]._id,
        locationDescription: `Platform ${i + 1}, ${amenityTypes[i + 1].label}`,
        status: i === 1 ? 'out_of_service' : 'ok',
        lastInspectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        notes: i === 1 ? 'Out of service - awaiting repair' : '',
        photos: [],
      });
    }

    // WTS amenities
    for (let i = 0; i < 3; i++) {
      stationAmenities.push({
        stationId: stations[2]._id,
        amenityTypeId: amenityTypes[i + 2]._id,
        locationDescription: `Platform ${i + 1}, ${amenityTypes[i + 2].label}`,
        status: 'ok',
        lastInspectedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        notes: '',
        photos: [],
      });
    }

    const createdAmenities = await StationAmenity.insertMany(stationAmenities);
    console.log('✅ Created station amenities');

    // Create sample issues
    const issues = await Issue.insertMany([
      {
        stationId: stations[0]._id,
        stationAmenityId: createdAmenities[0]._id,
        reportedById: users[5]._id, // Public user
        priority: 'high',
        status: 'reported',
        description: 'Water booth is not working - no water coming out',
        photos: [],
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        stationId: stations[0]._id,
        stationAmenityId: createdAmenities[1]._id,
        reportedById: users[3]._id, // Staff member
        assignedToId: users[1]._id, // Station manager
        priority: 'medium',
        status: 'assigned',
        description: 'Toilet door is broken and cannot be locked',
        photos: [],
        reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        stationId: stations[1]._id,
        stationAmenityId: createdAmenities[4]._id,
        reportedById: users[5]._id, // Public user
        priority: 'low',
        status: 'acknowledged',
        description: 'Seating area needs cleaning',
        photos: [],
        reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        stationId: stations[1]._id,
        stationAmenityId: createdAmenities[5]._id,
        reportedById: users[4]._id, // Staff member
        assignedToId: users[2]._id, // Station manager
        priority: 'high',
        status: 'resolved',
        description: 'Lighting system malfunction in platform 2',
        photos: [],
        reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        stationId: stations[2]._id,
        reportedById: users[5]._id, // Public user
        priority: 'medium',
        status: 'reported',
        description: 'General maintenance required for station facilities',
        photos: [],
        reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ]);
    console.log('✅ Created sample issues');

    // Create sample inspections
    const inspections = await Inspection.insertMany([
      {
        stationAmenityId: createdAmenities[0]._id,
        staffId: users[3]._id, // Staff member
        status: 'ok',
        notes: 'Water booth working properly',
        photos: [],
      },
      {
        stationAmenityId: createdAmenities[1]._id,
        staffId: users[3]._id, // Staff member
        status: 'needs_maintenance',
        notes: 'Toilet door needs repair',
        photos: [],
      },
      {
        stationAmenityId: createdAmenities[2]._id,
        staffId: users[4]._id, // Staff member
        status: 'ok',
        notes: 'Seating area clean and functional',
        photos: [],
      },
      {
        stationAmenityId: createdAmenities[4]._id,
        staffId: users[4]._id, // Staff member
        status: 'out_of_service',
        notes: 'Lighting system malfunction',
        photos: [],
      },
      {
        stationAmenityId: createdAmenities[6]._id,
        staffId: users[3]._id, // Staff member
        status: 'ok',
        notes: 'Fan working properly',
        photos: [],
      },
    ]);
    console.log('✅ Created sample inspections');

    // Create sample reports
    const reports = await Report.insertMany([
      {
        stationId: stations[0]._id,
        date: new Date(),
        generatedById: users[1]._id, // Station manager
        summaryJson: {
          totalAmenities: 4,
          workingAmenities: 3,
          maintenanceNeeded: 1,
          uptimePercentage: 75,
          issuesReported: 2,
          inspectionsCompleted: 2,
        },
      },
      {
        stationId: stations[1]._id,
        date: new Date(),
        generatedById: users[2]._id, // Station manager
        summaryJson: {
          totalAmenities: 3,
          workingAmenities: 2,
          maintenanceNeeded: 1,
          uptimePercentage: 66.7,
          issuesReported: 2,
          inspectionsCompleted: 2,
        },
      },
      {
        stationId: stations[2]._id,
        date: new Date(),
        generatedById: users[0]._id, // SuperAdmin
        summaryJson: {
          totalAmenities: 3,
          workingAmenities: 3,
          maintenanceNeeded: 0,
          uptimePercentage: 100,
          issuesReported: 1,
          inspectionsCompleted: 1,
        },
      },
    ]);
    console.log('✅ Created sample reports');

    // Create configuration
    await Config.insertMany([
      {
        key: 'high_priority_threshold_hours',
        value: 4,
      },
      {
        key: 'overdue_issue_threshold_hours',
        value: 24,
      },
      {
        key: 'inspection_reminder_hours',
        value: 12,
      },
      {
        key: 'email_notifications_enabled',
        value: true,
      },
      {
        key: 'max_upload_size_mb',
        value: 5,
      },
    ]);
    console.log('✅ Created configuration');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Sample accounts created:');
    console.log('Super Admin: admin@railway.com / password123');
    console.log('Station Manager (CST): manager.cst@railway.com / password123');
    console.log('Station Manager (EJS): manager.ejs@railway.com / password123');
    console.log('Staff (CST): staff.cst@railway.com / password123');
    console.log('Staff (EJS): staff.ejs@railway.com / password123');
    console.log('Public User: public@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
