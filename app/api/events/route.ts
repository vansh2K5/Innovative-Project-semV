import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import Analytics from '@/lib/models/Analytics';
import User from '@/lib/models/User';
import { getUserFromRequest, verifyUserExists } from '@/lib/auth';

// GET all events
export async function GET(request: NextRequest) {
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

    // Verify user still exists in database
    const userExists = await verifyUserExists(tokenUser.userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User account no longer exists' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build query
    const query: any = {};

    // Users see events they created or are assigned to, admins see all
    if (tokenUser.role !== 'admin') {
      query.$or = [
        { createdBy: tokenUser.userId },
        { assignedTo: tokenUser.userId },
      ];
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Get total count
    const total = await Event.countDocuments(query);

    // Get events with pagination
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to fetch events',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}

// POST create new event
export async function POST(request: NextRequest) {
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

    // Validate input
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Create new event
    const event = new Event({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type: type || 'other',
      priority: priority || 'medium',
      status: 'pending', // Always use 'pending' for new events
      createdBy: tokenUser.userId,
      assignedTo: assignedTo || [],
      location,
      isAllDay: isAllDay || false,
      recurrence,
      reminders: reminders || [],
    });

    await event.save();

    // Log analytics activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { userId: tokenUser.userId, date: today },
      {
        $push: {
          activities: {
            type: 'event_created',
            timestamp: new Date(),
            metadata: { eventId: event._id, eventTitle: event.title },
          },
        },
      },
      { upsert: true, new: true }
    );

    // Populate and return the created event
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: populatedEvent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    
    // Handle specific Mongoose validation errors
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
        message: error.message || 'Failed to create event',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      },
      { status: 500 }
    );
  }
}
