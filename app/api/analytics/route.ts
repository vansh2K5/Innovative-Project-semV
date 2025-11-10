import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import { getUserFromRequest } from '@/lib/auth';

// GET analytics data
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || tokenUser.userId;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');

    // Check permissions
    if (userId !== tokenUser.userId && tokenUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only view your own analytics' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    // Get analytics data
    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .populate('userId', 'name email');

    return NextResponse.json(
      { analytics },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create or update analytics
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
    const { date, metrics, activity } = body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const updateData: any = {};

    // Update metrics if provided
    if (metrics) {
      if (metrics.tasksCompleted !== undefined) {
        updateData['metrics.tasksCompleted'] = metrics.tasksCompleted;
      }
      if (metrics.tasksCreated !== undefined) {
        updateData['metrics.tasksCreated'] = metrics.tasksCreated;
      }
      if (metrics.eventsAttended !== undefined) {
        updateData['metrics.eventsAttended'] = metrics.eventsAttended;
      }
      if (metrics.hoursWorked !== undefined) {
        updateData['metrics.hoursWorked'] = metrics.hoursWorked;
      }
      if (metrics.productivityScore !== undefined) {
        updateData['metrics.productivityScore'] = metrics.productivityScore;
      }
    }

    // Add activity if provided
    const pushData: any = {};
    if (activity) {
      pushData.activities = {
        type: activity.type,
        timestamp: activity.timestamp || new Date(),
        metadata: activity.metadata,
      };
    }

    const analytics = await Analytics.findOneAndUpdate(
      { userId: tokenUser.userId, date: targetDate },
      {
        ...(Object.keys(updateData).length > 0 && { $set: updateData }),
        ...(Object.keys(pushData).length > 0 && { $push: pushData }),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        message: 'Analytics updated successfully',
        analytics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
