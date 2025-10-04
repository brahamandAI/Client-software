import 'dotenv/config';
import connectDB from '../lib/db';
import Station from '../models/Station';
import StationAmenity from '../models/StationAmenity';

async function debugData() {
  console.log('🔍 Debugging Database Data...\n');
  
  try {
    await connectDB();
    console.log('✅ Database connected\n');

    // Get stations
    const stations = await Station.find({});
    console.log('🏢 Stations:');
    stations.forEach(station => {
      console.log(`  ${station.name} (${station.code}) - ID: ${station._id}`);
    });

    // Get amenities
    const amenities = await StationAmenity.find({});
    console.log('\n🏗️ Station Amenities:');
    amenities.forEach(amenity => {
      console.log(`  Station ID: ${amenity.stationId}, Type ID: ${amenity.amenityTypeId}, Status: ${amenity.status}`);
    });

    // Check if station IDs match
    console.log('\n🔗 Matching Check:');
    stations.forEach(station => {
      const stationAmenities = amenities.filter(amenity => 
        amenity.stationId.toString() === station._id.toString()
      );
      console.log(`${station.name}: ${stationAmenities.length} amenities`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugData();
