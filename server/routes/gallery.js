const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Configure Multer for file upload
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

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        
        // Filter out invalid images and upgrade HTTP to HTTPS
        const validImages = images
            .filter(img => img.image && img.image.url)
            .map(img => {
                if (img.image.url.startsWith('http:')) {
                    img.image.url = img.image.url.replace('http:', 'https:');
                }
                return img;
            });
            
        res.json(validImages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/gallery
// @desc    Upload new image
// @access  Admin
router.post('/', [adminAuth, upload.single('image')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const uploadResult = await uploadToCloudinary(req.file.path);

        if (!uploadResult) {
            return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
        }

        // Sanitize inputs
        const title = req.body.title && req.body.title !== '' ? req.body.title : undefined;
        const category = req.body.category && req.body.category !== '' ? req.body.category : 'general';

        const newImage = new Gallery({
            title,
            image: {
                url: uploadResult.secure_url, // Ensures HTTPS
                publicId: uploadResult.public_id
            },
            category
        });

        const savedImage = await newImage.save();
        res.json(savedImage);
    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete an image
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        await image.deleteOne();
        res.json({ message: 'Image removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
