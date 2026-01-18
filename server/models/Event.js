const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['workshop', 'seminar', 'hackathon', 'competition', 'meetup', 'other'],
    default: 'workshop'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  registrationLink: {
    type: String,
    validate: {
      validator: function (v) {
        // Allow empty string or valid URL
        return v === '' || v == null || /^https?:\/\/.+/.test(v);
      },
      message: 'Registration link must be a valid URL'
    }
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  tags: [String],
  domains: [{
    type: String,
    enum: ['ML', 'IoT', 'Blockchain', 'Cybersecurity', 'General']
  }],
  organizers: [String],
  featured: {
    type: Boolean,
    default: false
  },
  analytics: {
    views: { type: Number, default: 0 },
    registrationClicks: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ featured: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);