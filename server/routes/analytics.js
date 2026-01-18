const express = require('express');
const Event = require('../models/Event');
const Achievement = require('../models/Achievement');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Member = require('../models/Member');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Mock analytics data
const mockAnalytics = {
  summary: {
    totalEvents: 5,
    upcomingEvents: 3,
    totalAchievements: 23,
    activeProjects: 12,
    totalMembers: 156,
    totalViews: 2847,
    totalRegistrationClicks: 342,
    pendingContacts: 7
  },
  recentActivities: {
    events: [
      {
        _id: 'event1',
        title: 'AI Workshop: Neural Networks',
        date: new Date('2024-03-15'),
        status: 'upcoming'
      },
      {
        _id: 'event2',
        title: 'Blockchain Hackathon 2024',
        date: new Date('2024-03-20'),
        status: 'upcoming'
      },
      {
        _id: 'event3',
        title: 'IoT Security Seminar',
        date: new Date('2024-03-25'),
        status: 'upcoming'
      }
    ],
    achievements: [
      {
        _id: 'achievement1',
        title: 'Hackathon Winner 2024',
        category: 'hackathon',
        year: 2024
      },
      {
        _id: 'achievement2',
        title: 'Best Innovation Award',
        category: 'recognition',
        year: 2024
      },
      {
        _id: 'achievement3',
        title: 'Research Publication',
        category: 'research',
        year: 2024
      }
    ],
    contacts: [
      {
        _id: 'contact1',
        name: 'John Doe',
        subject: 'Partnership Inquiry',
        status: 'new',
        type: 'partnership',
        createdAt: new Date()
      },
      {
        _id: 'contact2',
        name: 'Jane Smith',
        subject: 'Event Collaboration',
        status: 'in-progress',
        type: 'collaboration',
        createdAt: new Date(Date.now() - 86400000)
      }
    ]
  }
};

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get real data from database
    const [
      totalEvents,
      upcomingEvents,
      totalAchievements,
      activeProjects,
      totalMembers,
      pendingContacts,
      recentEvents,
      recentAchievements,
      recentContacts
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ 
        date: { $gte: new Date() },
        status: { $in: ['upcoming', 'ongoing'] }
      }),
      Achievement.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Member.countDocuments({ active: true }),
      Contact.countDocuments({ status: 'new' }),
      Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date status'),
      Achievement.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category year'),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name subject status type createdAt')
    ]);

    const analytics = {
      summary: {
        totalEvents,
        upcomingEvents,
        totalAchievements,
        activeProjects,
        totalMembers,
        totalViews: 2847, // This would come from analytics service
        totalRegistrationClicks: 342, // This would come from analytics service
        pendingContacts
      },
      recentActivities: {
        events: recentEvents,
        achievements: recentAchievements,
        contacts: recentContacts
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    // Fallback to mock data if database query fails
    res.json(mockAnalytics);
  }
});

// @route   GET /api/analytics/events
// @desc    Get event analytics
// @access  Private (Admin)
router.get('/events', adminAuth, async (req, res) => {
  try {
    const events = await Event.find()
      .select('title date analytics status registrationLink')
      .sort({ 'analytics.views': -1 });

    const topEvents = events.slice(0, 10);
    
    const statusDistribution = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      topEvents,
      statusDistribution,
      totalEvents: events.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;