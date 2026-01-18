const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['hackathon', 'competition', 'research', 'recognition', 'certification', 'other'],
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: new Date().getFullYear() + 1
  },
  date: {
    type: Date,
    required: true
  },
  position: {
    type: String,
    enum: ['1st', '2nd', '3rd', 'Winner', 'Runner-up', 'Finalist', 'Participant', 'Other']
  },
  event: {
    name: String,
    organizer: String,
    location: String
  },
  teamMembers: [String],
  domains: [{
    type: String,
    enum: ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General']
  }],
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  links: [{
    type: {
      type: String,
      enum: ['Paper', 'Demo', 'GitHub', 'Website', 'Certificate', 'Other']
    },
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL'
      }
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

achievementSchema.index({ year: -1, category: 1 });
achievementSchema.index({ featured: 1, date: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);