const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');
const { auth: adminAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// @route   GET /api/achievements
// @desc    Get all achievements (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, year, domain, featured, limit = 10, page = 1 } = req.query;

    let query = {};
    if (category) query.category = category;
    if (year) query.year = parseInt(year);
    if (domain) query.domains = domain;
    if (featured) query.featured = featured === 'true';

    const achievements = await Achievement.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Achievement.countDocuments(query);

    // Get unique years for filter
    const years = await Achievement.distinct('year');

    res.json({
      achievements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      years: years.sort((a, b) => b - a)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/achievements/:id
// @desc    Get single achievement
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/achievements
// @desc    Create achievement
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  upload.single('image'),
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('category').isIn(['hackathon', 'competition', 'research', 'recognition', 'certification', 'other']),
  body('year').isInt(),
  body('date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    let images = [];
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      if (uploadResult) {
        images.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: req.body.title
        });
      }
    }

    // Parse Arrays and Objects
    const teamMembers = req.body.teamMembers ? (Array.isArray(req.body.teamMembers) ? req.body.teamMembers : req.body.teamMembers.split(',').map(t => t.trim())) : [];

    let rawDomains = [];
    if (req.body.domains) {
      if (Array.isArray(req.body.domains)) {
        rawDomains = req.body.domains.flat(Infinity);
      } else {
        // Handle weird string formats like "[['ML']]" or "ML, IoT"
        let str = String(req.body.domains).trim();
        if (str.startsWith('[')) {
          try {
            // Try JSON parse first
            rawDomains = JSON.parse(str).flat(Infinity);
          } catch (e) {
            // Fallback: replace brackets and quotes, then split
            rawDomains = str.replace(/[\[\]"']/g, '').split(',');
          }
        } else {
          rawDomains = str.split(',');
        }
      }
    }
    const allowedDomains = ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General'];
    const domains = rawDomains.map(d => typeof d === 'string' ? d.trim() : d).filter(d => allowedDomains.includes(d));

    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : [];

    let event = {};
    if (req.body.eventName || req.body.eventOrganizer) {
      event = {
        name: req.body.eventName,
        organizer: req.body.eventOrganizer,
        location: req.body.eventLocation
      };
    } else if (req.body.event) {
      try {
        event = typeof req.body.event === 'string' ? JSON.parse(req.body.event) : req.body.event;
      } catch (e) { }
    }

    const achievement = new Achievement({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      year: req.body.year,
      date: req.body.date,
      position: req.body.position,
      event: event,
      teamMembers,
      domains,
      images,
      tags,
      featured: req.body.featured === 'true' || req.body.featured === true
    });

    await achievement.save();

    res.status(201).json(achievement);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/achievements/:id
// @desc    Update achievement
// @access  Private (Admin)
router.put('/:id', [adminAuth, upload.single('image')], async (req, res) => {
  try {
    let achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      if (uploadResult) {
        achievement.images = [{
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: req.body.title
        }];
      }
    }

    const fields = ['title', 'description', 'category', 'year', 'date', 'position'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) achievement[field] = req.body[field];
    });

    if (req.body.featured !== undefined) achievement.featured = req.body.featured === 'true' || req.body.featured === true;

    if (req.body.teamMembers) achievement.teamMembers = Array.isArray(req.body.teamMembers) ? req.body.teamMembers : req.body.teamMembers.split(',').map(t => t.trim());

    if (req.body.domains) {
      let rawDomains = Array.isArray(req.body.domains) ? req.body.domains.flat(Infinity) : [req.body.domains];
      const allowedDomains = ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General'];
      achievement.domains = rawDomains.filter(d => allowedDomains.includes(d));
    }

    if (req.body.tags) achievement.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());

    if (req.body.eventName !== undefined) achievement.event.name = req.body.eventName;
    if (req.body.eventOrganizer !== undefined) achievement.event.organizer = req.body.eventOrganizer;
    if (req.body.eventLocation !== undefined) achievement.event.location = req.body.eventLocation;

    await achievement.save();
    res.json(achievement);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/achievements/:id
// @desc    Delete achievement
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
