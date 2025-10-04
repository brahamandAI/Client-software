import mongoose, { Document, Schema } from 'mongoose';

export interface IAmenityType extends Document {
  key: string;
  label: string;
}

const AmenityTypeSchema = new Schema<IAmenityType>({
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.models.AmenityType || mongoose.model<IAmenityType>('AmenityType', AmenityTypeSchema);
