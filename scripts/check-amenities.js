require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const StationAmenity = require('../models/StationAmenity');
const AmenityType = require('../models/AmenityType');

async function checkAmenities() {
  console.log('🔍 Checking Amenities Data...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected\n');

    // Check AmenityTypes
    const amenityTypes = await AmenityType.find({});
    console.log('📋 Amenity Types:');
    console.log('='.repeat(50));
    if (amenityTypes.length === 0) {
      console.log('❌ No amenity types found in database');
    } else {
      amenityTypes.forEach((type, index) => {
        console.log(`${index + 1}. Key: ${type.key}`);
        console.log(`   Label: ${type.label}`);
        console.log(`   ID: ${type._id}`);
        console.log('');
      });
    }

    // Check StationAmenities
    const stationAmenities = await StationAmenity.find({}).populate('amenityTypeId');
    console.log('🏢 Station Amenities:');
    console.log('='.repeat(50));
    if (stationAmenities.length === 0) {
      console.log('❌ No station amenities found in database');
    } else {
      stationAmenities.forEach((amenity, index) => {
        console.log(`${index + 1}. Station ID: ${amenity.stationId}`);
        console.log(`   Amenity Type: ${amenity.amenityTypeId ? amenity.amenityTypeId.label : 'NULL'}`);
        console.log(`   Location: ${amenity.locationDescription}`);
        console.log(`   Status: ${amenity.status}`);
        console.log(`   ID: ${amenity._id}`);
        console.log('');
      });
    }

    console.log(`📊 Total Amenity Types: ${amenityTypes.length}`);
    console.log(`📊 Total Station Amenities: ${stationAmenities.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAmenities();
