import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    eventsAttended: number;
    hoursWorked: number;
    productivityScore: number;
  };
  activities: {
    type: 'login' | 'logout' | 'task_created' | 'task_completed' | 'event_created' | 'event_attended';
    timestamp: Date;
    metadata?: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      tasksCompleted: {
        type: Number,
        default: 0,
      },
      tasksCreated: {
        type: Number,
        default: 0,
      },
      eventsAttended: {
        type: Number,
        default: 0,
      },
      hoursWorked: {
        type: Number,
        default: 0,
      },
      productivityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    activities: [
      {
        type: {
          type: String,
          enum: ['login', 'logout', 'task_created', 'task_completed', 'event_created', 'event_attended'],
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
        },
        metadata: {
          type: Schema.Types.Mixed,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
AnalyticsSchema.index({ userId: 1, date: -1 });
AnalyticsSchema.index({ date: -1 });

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
