import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  stationId: mongoose.Types.ObjectId;
  date: Date;
  generatedById: mongoose.Types.ObjectId;
  summaryJson: Record<string, any>;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  stationId: {
    type: Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  generatedById: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  summaryJson: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
