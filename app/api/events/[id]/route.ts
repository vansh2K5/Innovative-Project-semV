import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Analytics from '@/lib/models/Analytics';
import User from '@/lib/models/User';
import UserPermissions from '@/lib/models/UserPermissions';
import { getUserFromRequest } from '@/lib/auth';

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await Event.findById(id)
      .populate('createdBy', '_id name email')
      .populate('assignedTo', '_id name email');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this event
    const hasAccess =
      tokenUser.role === 'admin' ||
      event.createdBy._id.toString() === tokenUser.userId ||
      event.assignedTo.some((user: any) => user._id.toString() === tokenUser.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to fetch event',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update this event
    const canUpdate =
      tokenUser.role === 'admin' ||
      event.createdBy.toString() === tokenUser.userId;

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Forbidden: Only event creator or admin can update' },
        { status: 403 }
      );
    }

    // For non-admin users, also check the canEditEvents permission
    if (tokenUser.role !== 'admin' && tokenUser.role !== 'securityadmin') {
      const userPermissions = await UserPermissions.findOne({ userId: tokenUser.userId });
      if (userPermissions && !userPermissions.canEditEvents) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to edit events' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      type,
      priority,
      status,
      assignedTo,
      location,
      isAllDay,
      recurrence,
      reminders,
    } = body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (type) updateData.type = type;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (location !== undefined) updateData.location = location;
    if (isAllDay !== undefined) updateData.isAllDay = isAllDay;
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    if (reminders !== undefined) updateData.reminders = reminders;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', '_id name email')
      .populate('assignedTo', '_id name email');

    // Log analytics if status changed to completed
    if (status === 'completed' && event.status !== 'completed') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await Analytics.findOneAndUpdate(
        { userId: tokenUser.userId, date: today },
        {
          $inc: { 'metrics.tasksCompleted': 1 },
          $push: {
            activities: {
              type: 'task_completed',
              timestamp: new Date(),
              metadata: { eventId: event._id, eventTitle: event.title },
            },
          },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(
      {
        message: 'Event updated successfully',
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update event error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: error.message,
          details: Object.values(error.errors).map((e: any) => e.message)
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to update event',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this event
    const canDelete =
      tokenUser.role === 'admin' ||
      event.createdBy.toString() === tokenUser.userId;

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: Only event creator or admin can delete' },
        { status: 403 }
      );
    }

    // For non-admin users, also check the canDeleteEvents permission
    if (tokenUser.role !== 'admin' && tokenUser.role !== 'securityadmin') {
      const userPermissions = await UserPermissions.findOne({ userId: tokenUser.userId });
      if (userPermissions && !userPermissions.canDeleteEvents) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to delete events' },
          { status: 403 }
        );
      }
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to delete event',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}
