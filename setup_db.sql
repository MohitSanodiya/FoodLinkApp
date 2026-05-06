-- SQL Script to extend existing FoodLink schema for Admin Panel
-- Run this in your MySQL database (foodlink)

-- 1. Add new columns to 'users' table
ALTER TABLE users 
ADD COLUMN role ENUM('HOSTEL', 'NGO', 'GAUSHALA', 'ADMIN') DEFAULT 'HOSTEL' AFTER password,
ADD COLUMN status ENUM('ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED') DEFAULT 'PENDING' AFTER role,
ADD COLUMN isVerified BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE AFTER isVerified;

-- 2. Add description and soft-delete to 'food_listings' table
ALTER TABLE food_listings
ADD COLUMN description TEXT AFTER title,
ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE AFTER created_by_id;

-- 3. Set existing users to active (Optional, but recommended for current users)
UPDATE users SET status = 'ACTIVE' WHERE role != 'ADMIN';

-- 4. Set existing NGOs/Gaushalas to verified if needed
UPDATE users SET isVerified = TRUE WHERE role IN ('NGO', 'GAUSHALA');

-- NOTE: The Node.js backend uses Port 5000.
-- Make sure to run 'node seeders/adminSeeder.js' from the node-backend folder 
-- to create your first admin account (admin@foodlink.com / admin123).
