"use server";

import MyItems from "../modals/myitems.modal";
import { connect } from "../db";

/**
 * Creates a new item in the database
 * @param {Object} data - item data to create
 * @returns {Promise<Object>} Created item object
 * @throws {Error} If creation fails
 */
export const createMyItem = async (data) => {
    try {
        await connect();
        const newItem = await MyItems.create(data);
        return JSON.parse(JSON.stringify(newItem));
    } catch (error) {
        console.error("Error creating item:", error);
        throw error;
    }
};

/**
 * Gets all items from the database
 * @returns {Promise<Array>} Array of items
 */
export const getAllMyItems = async () => {
    try {
        await connect();
        const items = await MyItems.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.error("Error fetching items:", error);
        throw error;
    }
};

/**
 * Gets an item by its ID
 * @param {string} id - Item ID
 * @returns {Promise<Object|null>} Item object or null if not found
 */
export const getMyItemById = async (id) => {
    try {
        await connect();
        const item = await MyItems.findOne({ myItemsId: id });
        return item ? JSON.parse(JSON.stringify(item)) : null;
    } catch (error) {
        console.error("Error fetching item by ID:", error);
        return null;
    }
};

/**
 * Updates an item by its ID
 * @param {string} id - Item ID
 * @param {Object} data - Updated item data
 * @returns {Promise<Object|null>} Updated item object or null on error
 */
export const updateMyItem = async (id, data) => {
    try {
        await connect();
        const updatedItem = await MyItems.findOneAndUpdate(
            { myItemsId: id }, 
            data, 
            { new: true }
        );
        return updatedItem ? JSON.parse(JSON.stringify(updatedItem)) : null;
    } catch (error) {
        console.error("Error updating item:", error);
        return null;
    }
};

/**
 * Deletes an item by its ID
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Object with success status and search_Id if available
 */
export const deleteMyItem = async (id) => {
    try {
        await connect();
        const item = await MyItems.findOne({ myItemsId: id });
        if (!item) {
            console.log(`Item with ID ${id} not found`);
            return { success: false, searchId: null };
        }
        
        const searchId = item.search_Id;
        const result = await MyItems.findOneAndDelete({ myItemsId: id });
        
        return { 
            success: !!result, 
            searchId: searchId 
        };
    } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, searchId: null };
    }
};
/**
 * Gets items by category
 * @param {string} category - Category to filter by
 * @returns {Promise<Array>} Array of items in the specified category
 */
export const getMyItemsByCategory = async (category) => {
    try {
        await connect();
        const items = await MyItems.find({ Category: category }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.error("Error fetching items by category:", error);
        throw error;
    }
};

/**
 * Gets items by user ID
 * @param {string} userId - User ID to filter by
 * @returns {Promise<Array>} Array of items belonging to the specified user
 */
export const getMyItemsByUserId = async (userId) => {
    try {
        await connect();
        const items = await MyItems.find({ userId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.error("Error fetching items by user ID:", error);
        throw error;
    }
};