import mongoose, { Document, Schema } from 'mongoose';

export interface IStationAmenity extends Document {
  stationId: mongoose.Types.ObjectId;
  amenityTypeId: mongoose.Types.ObjectId;
  locationDescription: string;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  lastInspectedAt?: Date;
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StationAmenitySchema = new Schema<IStationAmenity>({
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  amenityTypeId: {
    type: Schema.Types.ObjectId,
    ref: 'AmenityType',
    required: true,
  },
  locationDescription: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['ok', 'needs_maintenance', 'out_of_service'],
    default: 'ok',
  },
  lastInspectedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  photos: [{
    type: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.StationAmenity || mongoose.model<IStationAmenity>('StationAmenity', StationAmenitySchema);
