import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  stationId: mongoose.Types.ObjectId;
  stationAmenityId?: mongoose.Types.ObjectId;
  reportedById: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'acknowledged' | 'assigned' | 'resolved' | 'closed';
  description: string;
  photos: string[];
  reportedAt: Date;
  acknowledgedAt?: Date;
  assignedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  stationAmenityId: {
    type: Schema.Types.ObjectId,
    ref: 'StationAmenity',
  },
  reportedById: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedToId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  status: {
    type: String,
    enum: ['reported', 'acknowledged', 'assigned', 'resolved', 'closed'],
    default: 'reported',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  photos: [{
    type: String,
  }],
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  acknowledgedAt: {
    type: Date,
  },
  assignedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  closedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
