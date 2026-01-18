const express = require('express');
const multer = require('multer');
const Member = require('../models/Member');
const { adminAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Configure Multer for file upload
const upload = multer({ dest: 'uploads/' });

// @route   GET /api/members
// @desc    Get all members (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { team, domain, active = 'true', search } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (active !== 'all') {
      query.isActive = active === 'true';
    }
    
    // Filter by team
    if (team) query.team = team;
    
    // Filter by domain
    if (domain) query.domains = domain;
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await Member.find(query)
      .sort({ team: 1, position: 1, name: 1 })
      .select('-email'); // Hide email from public

    res.json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const memberData = { ...req.body };
    
    // Parse JSON fields that come as strings from FormData
    if (typeof memberData.social === 'string') {
      memberData.social = JSON.parse(memberData.social);
    }
    if (typeof memberData.domains === 'string') {
      memberData.domains = JSON.parse(memberData.domains);
    }
    if (typeof memberData.skills === 'string') {
      memberData.skills = JSON.parse(memberData.skills);
    }
    
    // Handle image upload
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      if (cloudinaryResponse) {
        memberData.image = {
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id
        };
      }
    }
    
    const member = new Member(memberData);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const memberData = { ...req.body };
    
    // Parse JSON fields that come as strings from FormData
    if (typeof memberData.social === 'string') {
      memberData.social = JSON.parse(memberData.social);
    }
    if (typeof memberData.domains === 'string') {
      memberData.domains = JSON.parse(memberData.domains);
    }
    if (typeof memberData.skills === 'string') {
      memberData.skills = JSON.parse(memberData.skills);
    }
    
    // Handle image upload
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      if (cloudinaryResponse) {
        memberData.image = {
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id
        };
      }
    }
    
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      memberData,
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;