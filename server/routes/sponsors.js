const express = require('express');
const Sponsor = require('../models/Sponsor');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sponsors
// @desc    Get all sponsors (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active = 'true', featured } = req.query;
    
    let query = { isActive: active === 'true' };
    if (featured) query.featured = featured === 'true';

    const sponsors = await Sponsor.find(query)
      .sort({ tier: 1, name: 1 })
      .select('-contactPerson -amount'); // Hide sensitive info from public

    res.json({ sponsors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
router.post('/', adminAuth, async (req, res) => {
  try {
    const sponsorData = { ...req.body };
    // Sanitize
    if (sponsorData.amount === '') delete sponsorData.amount;
    if (sponsorData.startDate === '') delete sponsorData.startDate;
    if (sponsorData.endDate === '') delete sponsorData.endDate;
    if (sponsorData.tier === '') delete sponsorData.tier; 
    if (sponsorData.sponsorshipType === '') delete sponsorData.sponsorshipType;

    const sponsor = new Sponsor(sponsorData);
    await sponsor.save();
    res.status(201).json(sponsor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const sponsorData = { ...req.body };
    if (sponsorData.amount === '') sponsorData.amount = undefined;
    if (sponsorData.startDate === '') sponsorData.startDate = undefined;
    if (sponsorData.endDate === '') sponsorData.endDate = undefined; // null might be better to clear it?
    // If we want to clear endDate on update by sending empty string, we should set null
    if (sponsorData.endDate === '') sponsorData.endDate = null;
    
    if (sponsorData.tier === '') sponsorData.tier = undefined;
    if (sponsorData.sponsorshipType === '') sponsorData.sponsorshipType = undefined;

    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      sponsorData,
      { new: true, runValidators: true }
    );
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }
    res.json(sponsor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;