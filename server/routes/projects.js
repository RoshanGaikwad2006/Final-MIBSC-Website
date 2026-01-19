const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
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

// @route   GET /api/projects
// @desc    Get all projects (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, domain, featured, difficulty, limit = 10, page = 1 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (domain) query.domains = domain;
    if (featured) query.featured = featured === 'true';
    if (difficulty) query.difficulty = difficulty;

    const projects = await Project.find(query)
      .sort({ featured: -1, updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create project
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  upload.single('image'),
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('startDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Project POST body:', req.body);
    console.log('Project POST file:', req.file);

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

    // Parse array fields
    const techStack = req.body.techStack ? (Array.isArray(req.body.techStack) ? req.body.techStack : req.body.techStack.split(',').map(t => t.trim())) : [];

    // Robust domains parsing
    let rawDomains = [];
    if (req.body.domains) {
      if (Array.isArray(req.body.domains)) {
        rawDomains = req.body.domains.flat(Infinity);
      } else {
        // Handle weird string formats like "[['ML']]" or "ML, IoT"
        let str = String(req.body.domains).trim();
        if (str.startsWith('[')) {
          try {
            // Try JSON parse first (handles JSON stringified arrays)
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

    // Parse JSON fields if sent as string
    let teamMembers = [];
    if (req.body.teamMembers) {
      try {
        teamMembers = typeof req.body.teamMembers === 'string' ? JSON.parse(req.body.teamMembers) : req.body.teamMembers;
      } catch (e) {
        console.error('Error parsing teamMembers', e);
      }
    }

    let links = {};
    if (req.body.links) {
      try {
        links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
      } catch (e) {
        console.error('Error parsing links', e);
      }
    } else {
      // Fallback for flat fields if form sends them separately
      links = {
        github: req.body.githubLink,
        demo: req.body.demoLink,
        documentation: req.body.docLink
      };
    }

    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      techStack,
      domains,
      status: req.body.status || 'planning',
      startDate: req.body.startDate,
      endDate: req.body.endDate || null,
      teamMembers,
      links,
      images,
      tags,
      featured: req.body.featured === 'true' || req.body.featured === true,
      difficulty: req.body.difficulty || 'Intermediate'
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin)
router.put('/:id', [adminAuth, upload.single('image')], async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path);
      if (uploadResult) {
        project.images = [{
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: req.body.title
        }];
      }
    }

    // Update simple fields
    const fields = ['title', 'description', 'shortDescription', 'status', 'startDate', 'endDate', 'difficulty'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if ((field === 'endDate' || field === 'startDate') && req.body[field] === '') {
          project[field] = null;
        } else if (field === 'difficulty' && req.body[field] === '') {
          project[field] = undefined; 
        } else if (field === 'status' && req.body[field] === '') {
          // Keep existing status if empty or handle as undefined
          // project[field] = undefined; 
          // Use default if undefined? No, update shouldn't revert to default usually. 
        } else {
           project[field] = req.body[field];
        }
      }
    });

    if (req.body.featured !== undefined) project.featured = req.body.featured === 'true' || req.body.featured === true;

    // Update Arrays
    if (req.body.techStack) project.techStack = Array.isArray(req.body.techStack) ? req.body.techStack : req.body.techStack.split(',').map(t => t.trim());

    if (req.body.domains) {
      let rawDomains = Array.isArray(req.body.domains) ? req.body.domains.flat(Infinity) : [req.body.domains];
      const allowedDomains = ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General'];
      project.domains = rawDomains.filter(d => allowedDomains.includes(d));
    }

    if (req.body.tags) project.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());

    // Update Complex Objects
    if (req.body.teamMembers) {
      try {
        project.teamMembers = typeof req.body.teamMembers === 'string' ? JSON.parse(req.body.teamMembers) : req.body.teamMembers;
      } catch (e) { }
    }

    if (req.body.links) {
      try {
        project.links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
      } catch (e) { }
    } else {
      // Individual link updates
      if (req.body.githubLink !== undefined) project.links.github = req.body.githubLink;
      if (req.body.demoLink !== undefined) project.links.demo = req.body.demoLink;
      if (req.body.docLink !== undefined) project.links.documentation = req.body.docLink;
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
