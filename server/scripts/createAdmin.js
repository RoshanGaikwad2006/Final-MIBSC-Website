const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');

// Load environment variables from the server directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Update the password to the new secure one
      existingAdmin.password = process.env.ADMIN_PASSWORD;
      await existingAdmin.save();
      
      console.log('Admin password updated successfully');
      console.log(`Email: ${process.env.ADMIN_EMAIL}`);
      console.log('Password: [UPDATED - Check .env file]');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'MIBCS Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log('Password: [HIDDEN - Check .env file]');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();