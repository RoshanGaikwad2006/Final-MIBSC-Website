const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const { auth: adminAuth } = require('../middleware/auth'); // Check if auth export matches
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Multer setup for temporary local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure directory exists or let multer create logic handle it usually but we need to make sure
    // For now we assume a temp folder or use /tmp. Let's rely on a 'uploads' folder being present or created
    // Actually, fs.mkdirSync logic might be needed if it doesn't exist, but let's assume root/uploads
    // Better yet, use /tmp for vercel/serverless compat or just 'uploads' in project root
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/events
// @desc    Get all events (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, domain, featured, limit = 10, page = 1 } = req.query;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (domain) filter.domains = domain;
    if (featured === 'true') filter.featured = true;

    // Sorting logic
    let sort = { date: 1, _id: 1 }; // Default: Oldest upcoming first? 
    // Actually usually upcoming is nearest first (ascending date), completed is newest first (descending date)
    if (status === 'completed') {
      sort = { date: -1, _id: 1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Event.countDocuments(filter);

    // Remove analytics from public response
    const publicEvents = events.map(event => {
      const eventObj = event.toObject();
      // Keep analytics for now as Admin might need it or we can filter based on auth later
      // delete eventObj.analytics; 
      return eventObj;
    });

    res.json({
      events: publicEvents,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment view count
    event.analytics.views += 1;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register-click
// @desc    Track registration button click
// @access  Public
router.post('/:id/register-click', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment registration click count
    event.analytics.registrationClicks += 1;
    await event.save();

    res.json({ message: 'Click tracked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create event
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  upload.single('image'), // Handle single image upload
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('date').isISO8601(),
  body('time').notEmpty(),
  body('venue').notEmpty()
], async (req, res) => {
  try {
    // Note: express-validator might struggle if body is multipart/form-data and not parsed before check?
    // Multer middleware runs first, so req.body should be populated.

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
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

    // Process arrays from form-data (which come as strings or arrays depending on frontend)
    // If sent as stringified JSON or plain comma separated strings?
    // Let's assume frontend sends proper keys. If array keys are used in FormData like 'tags[]', multer parses them if extended: true?
    // Since we used express.urlencoded extended: true, but that's for urlencoded. For multipart, multer handles it.
    // We might need to handle parsing manually if they come as strings.

    const domains = req.body.domains ? (Array.isArray(req.body.domains) ? req.body.domains : [req.body.domains]) : [];
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(tag => tag.trim())) : [];
    const organizers = req.body.organizers ? (Array.isArray(req.body.organizers) ? req.body.organizers : req.body.organizers.split(',').map(o => o.trim())) : [];

    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      shortDescription: req.body.shortDescription || '',
      date: req.body.date,
      endDate: req.body.endDate || null,
      time: req.body.time,
      venue: req.body.venue,
      type: req.body.type || 'workshop',
      status: req.body.status || 'upcoming',
      registrationLink: req.body.registrationLink || undefined, // undefined prevents validation check on optional field
      maxParticipants: req.body.maxParticipants || null,
      images: images,
      tags: tags,
      domains: domains,
      organizers: organizers,
      featured: req.body.featured === 'true' || req.body.featured === true
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin)
router.put('/:id', [adminAuth, upload.single('image')], async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Handle Image Upload if new image provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      if (uploadResult) {
        // Optionally delete old image from cloudinary here if we had logic for it
        event.images = [{
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: req.body.title
        }];
      }
    }

    // Update fields
    const fieldsToUpdate = ['title', 'description', 'shortDescription', 'date', 'endDate', 'time', 'venue', 'type', 'status', 'registrationLink', 'maxParticipants'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle empty strings for optional fields that might have validators
        if ((field === 'registrationLink' || field === 'endDate' || field === 'maxParticipants') && req.body[field] === '') {
          if (field === 'registrationLink') event[field] = undefined;
          else if (field === 'endDate') event[field] = null;
          else if (field === 'maxParticipants') event[field] = undefined;
        } else {
          event[field] = req.body[field];
        }
      }
    });

    if (req.body.featured !== undefined) event.featured = req.body.featured === 'true' || req.body.featured === true;

    // Handle arrays if provided
    if (req.body.tags) event.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
    if (req.body.domains) event.domains = Array.isArray(req.body.domains) ? req.body.domains : [req.body.domains];
    if (req.body.organizers) event.organizers = Array.isArray(req.body.organizers) ? req.body.organizers : req.body.organizers.split(',').map(o => o.trim());

    await event.save();
    res.json(event);

  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne(); // or findByIdAndDelete
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
