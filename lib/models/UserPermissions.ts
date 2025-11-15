import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPermissions extends Document {
  userId: mongoose.Types.ObjectId;
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewApplications: boolean;
  canManageUsers: boolean;
  canAccessSecurity: boolean;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserPermissionsSchema = new Schema<IUserPermissions>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    canViewCalendar: {
      type: Boolean,
      default: true,
    },
    canCreateEvents: {
      type: Boolean,
      default: true,
    },
    canEditEvents: {
      type: Boolean,
      default: false,
    },
    canDeleteEvents: {
      type: Boolean,
      default: false,
    },
    canViewApplications: {
      type: Boolean,
      default: true,
    },
    canManageUsers: {
      type: Boolean,
      default: false,
    },
    canAccessSecurity: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserPermissionsSchema.index({ userId: 1 });

export default mongoose.models.UserPermissions || mongoose.model<IUserPermissions>('UserPermissions', UserPermissionsSchema);
