import mongoose, { Document, Schema } from 'mongoose';

export interface IInspection extends Document {
  stationAmenityId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  status: 'ok' | 'needs_maintenance' | 'out_of_service';
  notes?: string;
  photos: string[];
  createdAt: Date;
}

const InspectionSchema = new Schema<IInspection>({
  stationAmenityId: {
    type: Schema.Types.ObjectId,
    ref: 'StationAmenity',
    required: true,
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['ok', 'needs_maintenance', 'out_of_service'],
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  photos: [{
    type: String,
  }],
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.models.Inspection || mongoose.model<IInspection>('Inspection', InspectionSchema);
