import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: {
    canViewCalendar: boolean;
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canViewApplications: boolean;
    canManageUsers: boolean;
    canAccessSecurity: boolean;
    canViewReports: boolean;
    canExportData: boolean;
  };
  isSystemRole: boolean;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      canViewCalendar: {
        type: Boolean,
        default: true,
      },
      canCreateEvents: {
        type: Boolean,
        default: false,
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
      canViewReports: {
        type: Boolean,
        default: false,
      },
      canExportData: {
        type: Boolean,
        default: false,
      },
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;

export const DEFAULT_ROLES = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: {
      canViewCalendar: true,
      canCreateEvents: true,
      canEditEvents: true,
      canDeleteEvents: true,
      canViewApplications: true,
      canManageUsers: true,
      canAccessSecurity: true,
      canViewReports: true,
      canExportData: true,
    },
    isSystemRole: true,
    isActive: true,
  },
  {
    name: 'securityadmin',
    displayName: 'Security Administrator',
    description: 'Security management and monitoring access',
    permissions: {
      canViewCalendar: true,
      canCreateEvents: true,
      canEditEvents: true,
      canDeleteEvents: false,
      canViewApplications: true,
      canManageUsers: true,
      canAccessSecurity: true,
      canViewReports: true,
      canExportData: true,
    },
    isSystemRole: true,
    isActive: true,
  },
  {
    name: 'user',
    displayName: 'Standard User',
    description: 'Basic user access with limited permissions',
    permissions: {
      canViewCalendar: true,
      canCreateEvents: true,
      canEditEvents: false,
      canDeleteEvents: false,
      canViewApplications: true,
      canManageUsers: false,
      canAccessSecurity: false,
      canViewReports: false,
      canExportData: false,
    },
    isSystemRole: true,
    isActive: true,
  },
];
