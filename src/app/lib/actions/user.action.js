"use server";

import User from "../modals/user.modal";
import { connect } from "../db";
//add
/**
 * Creates a new user in the database
 * @param {Object} user - User data to create
 * @returns {Promise<Object|null>} Created user object or null on error
 */
export async function createUser(user) {
  try {
    await connect();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function deleteUser(clerkId) {
  try {
    await connect();
    
    // Find and delete the user with the provided clerkId
    const deletedUser = await User.findOneAndDelete({ clerkId });
    
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Gets a user by their Clerk ID
 * @param {string} clerkId - Clerk ID to find user by
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByClerkId(clerkId) {
  try {
    await connect();
    const user = await User.findOne({ clerkId });
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error fetching user by clerkId:", error);
    return null;
  }
}

// read all user data from db
export async function getAllUsers() {
  try {
    await connect();

    // Fetch all users from the database
    const users = await User.find();

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error retrieving users:", error);
    return null;
  }
}

/**
 * Update user GPS location
 * @param {string} clerkId - Clerk ID of the user
 * @param {string} gps - GPS coordinates in format "lat,lng"
 * @returns {Promise<Object|null>} Updated user object or null on error
 */
export async function updateUserLocation(clerkId, gps) {
  try {
    await connect();
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { gps },
      { new: true }
    );
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating user location:", error);
    return null;
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {string} gps1 - First GPS coordinate "lat,lng"
 * @param {string} gps2 - Second GPS coordinate "lat,lng"
 * @returns {number} Distance in kilometers
 */
function calculateDistance(gps1, gps2) {
  if (!gps1 || !gps2) return Infinity;
  
  const [lat1, lon1] = gps1.split(',').map(Number);
  const [lat2, lon2] = gps2.split(',').map(Number);
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Get users within a specified radius from a GPS location
 * @param {string} centerGps - Center GPS coordinate "lat,lng"
 * @param {number} radiusKm - Radius in kilometers
 * @param {string} excludeClerkId - Clerk ID to exclude (e.g., post creator)
 * @returns {Promise<Array>} Array of nearby users with their distances
 */
export async function getNearbyUsers(centerGps, radiusKm = 10, excludeClerkId = null) {
  try {
    await connect();
    
    // Get all users with GPS data
    const users = await User.find({ gps: { $ne: null } });
    
    // Filter users within radius and calculate distances
    const nearbyUsers = users
      .filter(user => {
        // Exclude the specified user (post creator)
        if (excludeClerkId && user.clerkId === excludeClerkId) {
          return false;
        }
        
        const distance = calculateDistance(centerGps, user.gps);
        user.distance = distance; // Add distance to user object
        return distance <= radiusKm;
      })
      .map(user => ({
        ...JSON.parse(JSON.stringify(user)),
        distance: user.distance
      }));
    
    return nearbyUsers;
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return [];
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByEmail(email) {
  try {
    await connect();
    const user = await User.findOne({ email });
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

/**
 * Update user verification status and NIC
 * @param {string} clerkId - Clerk ID of the user
 * @param {boolean} isVerified - Verification status
 * @param {string} nic - National Identity Card number
 * @returns {Promise<Object|null>} Updated user object or null on error
 */
export async function updateUserVerification(clerkId, isVerified, nic) {
  try {
    await connect();
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { isVerified, nic },
      { new: true }
    );
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error updating user verification:", error);
    return null;
  }
}