const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    required: true
  },
  team: {
    type: String,
    enum: ['Super Senior', 'Senior Committee', 'Core Committee'],
    required: true
  },
  domains: [{
    type: String,
    enum: ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General']
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  image: {
    url: String,
    publicId: String
  },
  social: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  skills: [String],
  joinDate: {
    type: Date,
    default: Date.now
  },
  graduationYear: {
    type: Number,
    min: 2020,
    max: 2030
  },
  isActive: {
    type: Boolean,
    default: true
  },
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

memberSchema.index({ team: 1, position: 1 });
memberSchema.index({ isActive: 1, team: 1 });

module.exports = mongoose.model('Member', memberSchema);