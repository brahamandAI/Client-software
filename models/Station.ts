import mongoose, { Document, Schema } from 'mongoose';

export interface IStation extends Document {
  name: string;
  code: string;
  region: string;
  address: string;
  geoLat: number;
  geoLng: number;
  createdAt: Date;
  updatedAt: Date;
}

const StationSchema = new Schema<IStation>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  region: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  geoLat: {
    type: Number,
    required: true,
  },
  geoLng: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Station || mongoose.model<IStation>('Station', StationSchema);
