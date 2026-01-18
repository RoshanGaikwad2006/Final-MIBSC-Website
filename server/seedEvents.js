require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const seedEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mibcs');
        console.log('Connected to MongoDB');

        // Clear existing featured events to avoid duplicates if re-run (optional, or just add)
        // await Event.deleteMany({ featured: true }); 

        const events = [
            {
                title: 'Future of AI Workshop',
                description: 'Deep dive into Generative AI and its applications in modern software development. Join us for a hands-on session with industry experts.',
                shortDescription: 'Deep dive into Generative AI and its applications.',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                time: '10:00 AM',
                venue: 'Innovation Hub, Main Campus',
                type: 'workshop',
                status: 'upcoming',
                featured: true,
                maxParticipants: 50,
                registrationLink: 'https://forms.google.com/example',
                tags: ['AI', 'ML', 'Workshop'],
                domains: ['ML'],
                images: [{
                    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80',
                    caption: 'AI Workshop'
                }]
            },
            {
                title: 'MIBCS Hackathon 2025',
                description: '24-hour coding challenge to solve real-world problems using Blockchain and IoT. Prizes worth $5000!',
                shortDescription: '24-hour coding challenge to solve real-world problems.',
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                time: '09:00 AM',
                venue: 'Tech Auditorium',
                type: 'hackathon',
                status: 'upcoming',
                featured: true,
                maxParticipants: 200,
                registrationLink: 'https://forms.google.com/example',
                tags: ['Hackathon', 'Blockchain', 'IoT'],
                domains: ['Blockchain', 'IoT'],
                images: [{
                    url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80', // Working code image
                    caption: 'Hackathon'
                }]
            },
            {
                title: 'Cybersecurity Awareness Seminar',
                description: 'Learn how to protect digital assets and understand the latest threats in the cyber world.',
                shortDescription: 'Protect digital assets and understand latest threats.',
                date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
                time: '02:00 PM',
                venue: 'Seminar Hall 2',
                type: 'seminar',
                status: 'upcoming',
                featured: true,
                maxParticipants: 100,
                registrationLink: 'https://forms.google.com/example',
                tags: ['Security', 'Cyber', 'Seminar'],
                domains: ['Cybersecurity'],
                images: [{
                    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
                    caption: 'Cybersecurity'
                }]
            }
        ];

        await Event.insertMany(events);
        console.log('Mock featured events seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
};

seedEvents();
