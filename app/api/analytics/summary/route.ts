import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { getUserFromRequest } from '@/lib/auth';

// GET analytics summary
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
    const period = searchParams.get('period') || 'week'; // week, month, year

    // Check permissions
    if (userId !== tokenUser.userId && tokenUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Can only view your own analytics' },
        { status: 403 }
      );
    }

    // Calculate date range based on period
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get analytics data for the period
    const analytics = await Analytics.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Calculate aggregated metrics
    const summary = {
      totalTasksCompleted: 0,
      totalTasksCreated: 0,
      totalEventsAttended: 0,
      totalHoursWorked: 0,
      averageProductivityScore: 0,
      totalActivities: 0,
      activityBreakdown: {
        login: 0,
        logout: 0,
        task_created: 0,
        task_completed: 0,
        event_created: 0,
        event_attended: 0,
      },
      dailyMetrics: [] as any[],
    };

    let productivityScoreSum = 0;
    let daysWithScore = 0;

    analytics.forEach((day) => {
      summary.totalTasksCompleted += day.metrics.tasksCompleted || 0;
      summary.totalTasksCreated += day.metrics.tasksCreated || 0;
      summary.totalEventsAttended += day.metrics.eventsAttended || 0;
      summary.totalHoursWorked += day.metrics.hoursWorked || 0;

      if (day.metrics.productivityScore > 0) {
        productivityScoreSum += day.metrics.productivityScore;
        daysWithScore++;
      }

      summary.totalActivities += day.activities.length;

      // Count activities by type
      day.activities.forEach((activity) => {
        if (summary.activityBreakdown[activity.type as keyof typeof summary.activityBreakdown] !== undefined) {
          summary.activityBreakdown[activity.type as keyof typeof summary.activityBreakdown]++;
        }
      });

      // Add daily metrics
      summary.dailyMetrics.push({
        date: day.date,
        tasksCompleted: day.metrics.tasksCompleted,
        tasksCreated: day.metrics.tasksCreated,
        eventsAttended: day.metrics.eventsAttended,
        hoursWorked: day.metrics.hoursWorked,
        productivityScore: day.metrics.productivityScore,
        activitiesCount: day.activities.length,
      });
    });

    summary.averageProductivityScore = daysWithScore > 0
      ? Math.round(productivityScoreSum / daysWithScore)
      : 0;

    // Get additional stats if admin is viewing all users
    let additionalStats = {};
    if (tokenUser.role === 'admin' && !userId) {
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalEvents = await Event.countDocuments();
      const upcomingEvents = await Event.countDocuments({
        startDate: { $gte: new Date() },
        status: { $ne: 'cancelled' },
      });

      additionalStats = {
        totalUsers,
        totalEvents,
        upcomingEvents,
      };
    }

    return NextResponse.json(
      {
        summary,
        period,
        startDate,
        endDate,
        ...additionalStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get analytics summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
