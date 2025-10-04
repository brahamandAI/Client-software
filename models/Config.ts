import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigSchema = new Schema<IConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
