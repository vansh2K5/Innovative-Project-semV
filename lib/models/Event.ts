import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'meeting' | 'deadline' | 'task' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  targetRoles: string[];
  visibleToAll: boolean;
  location?: string;
  isAllDay: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  reminders: {
    type: 'email' | 'notification';
    minutesBefore: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['meeting', 'deadline', 'task', 'reminder', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    targetRoles: [
      {
        type: String,
        trim: true,
      },
    ],
    visibleToAll: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: {
        type: Number,
        min: 1,
      },
      endDate: Date,
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ['email', 'notification'],
        },
        minutesBefore: {
          type: Number,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ assignedTo: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ targetRoles: 1 });
EventSchema.index({ visibleToAll: 1 });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
