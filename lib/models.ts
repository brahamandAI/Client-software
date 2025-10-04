// Model registration file to ensure all Mongoose models are loaded
// This prevents "Schema hasn't been registered" errors

import User from '@/models/User';
import Station from '@/models/Station';
import AmenityType from '@/models/AmenityType';
import StationAmenity from '@/models/StationAmenity';
import Issue from '@/models/Issue';
import Inspection from '@/models/Inspection';
import Report from '@/models/Report';
import Config from '@/models/Config';

// Export all models to ensure they are registered
export {
  User,
  Station,
  AmenityType,
  StationAmenity,
  Issue,
  Inspection,
  Report,
  Config,
};

// This ensures all models are loaded when this file is imported
export default {
  User,
  Station,
  AmenityType,
  StationAmenity,
  Issue,
  Inspection,
  Report,
  Config,
};
