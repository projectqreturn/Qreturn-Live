"use server";

import Contact from "../modals/contact.modal";
import { connect } from "../db";

/**
 * 
 * @param {Object} contactData - Contact data to create
 * @param {string} contactData.userId - User ID (required)
 * @param {string} contactData.name - Contact name
 * @param {string} contactData.phone - Phone number
 * @param {string} contactData.facebookUrl - Facebook profile URL
 * @param {string} contactData.instagramUrl - Instagram profile URL
 * @param {string} contactData.note - Additional notes
 * @param {boolean} contactData.is_public - Public visibility flag
 * @returns {Promise<Object|null>} Created contact object or null on error
 */
export async function createContact(contactData) {
  try {
    await connect();
    const newContact = await Contact.create(contactData);
    return JSON.parse(JSON.stringify(newContact));
  } catch (error) {
    console.error("Error creating contact:", error);
    return null;
  }
}

/**
 * Retrieves a contact by contact ID
 * @param {number} contactId - Auto-incremented contact ID
 * @returns {Promise<Object|null>} Contact object or null if not found
 */
export async function getContactById(contactId) {
  try {
    await connect();
    const contact = await Contact.findOne({ contactId });
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error("Error retrieving contact by ID:", error);
    return null;
  }
}

/**
 * Retrieves all contacts for a specific user
 * @param {string} userId - User ID to filter contacts
 * @returns {Promise<Array|null>} Array of contact objects or null on error
 */
export async function getContactsByUserId(userId) {
  try {
    await connect();
    const contacts = await Contact.find({ userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(contacts));
  } catch (error) {
    console.error("Error retrieving contacts by user ID:", error);
    return null;
  }
}

/**
 * Retrieves all contacts from the database
 * @returns {Promise<Array|null>} Array of all contact objects or null on error
 */
export async function getAllContacts() {
  try {
    await connect();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(contacts));
  } catch (error) {
    console.error("Error retrieving all contacts:", error);
    return null;
  }
}

/**
 * Retrieves all public contacts
 * @returns {Promise<Array|null>} Array of public contact objects or null on error
 */
export async function getPublicContacts() {
  try {
    await connect();
    const contacts = await Contact.find({ is_public: true }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(contacts));
  } catch (error) {
    console.error("Error retrieving public contacts:", error);
    return null;
  }
}

/**
 * Updates a contact by contact ID
 * @param {number} contactId - Auto-incremented contact ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} Updated contact object or null on error
 */
export async function updateContact(contactId, updateData) {
  try {
    await connect();
    const updatedContact = await Contact.findOneAndUpdate(
      { contactId },
      updateData,
      { new: true, runValidators: true }
    );
    return JSON.parse(JSON.stringify(updatedContact));
  } catch (error) {
    console.error("Error updating contact:", error);
    return null;
  }
}

/**
 * Updates a contact by user ID
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} Updated contact object or null on error
 */
export async function updateContactByUserId(userId, updateData) {
  try {
    await connect();
    const updatedContact = await Contact.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );
    return JSON.parse(JSON.stringify(updatedContact));
  } catch (error) {
    console.error("Error updating contact by user ID:", error);
    return null;
  }
}

/**
 * Deletes a contact by contact ID
 * @param {number} contactId - Auto-incremented contact ID
 * @returns {Promise<Object|null>} Deleted contact object or null on error
 */
export async function deleteContact(contactId) {
  try {
    await connect();
    const deletedContact = await Contact.findOneAndDelete({ contactId });
    return JSON.parse(JSON.stringify(deletedContact));
  } catch (error) {
    console.error("Error deleting contact:", error);
    return null;
  }
}

/**
 * Deletes a contact by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Deleted contact object or null on error
 */
export async function deleteContactByUserId(userId) {
  try {
    await connect();
    const deletedContact = await Contact.findOneAndDelete({ userId });
    return JSON.parse(JSON.stringify(deletedContact));
  } catch (error) {
    console.error("Error deleting contact by user ID:", error);
    return null;
  }
}

/**
 * Deletes all contacts for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Deletion result or null on error
 */
export async function deleteAllContactsByUserId(userId) {
  try {
    await connect();
    const result = await Contact.deleteMany({ userId });
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error deleting all contacts by user ID:", error);
    return null;
  }
}

/**
 * Toggles the public visibility of a contact
 * @param {number} contactId - Auto-incremented contact ID
 * @returns {Promise<Object|null>} Updated contact object or null on error
 */
export async function toggleContactVisibility(contactId) {
  try {
    await connect();
    const contact = await Contact.findOne({ contactId });
    if (!contact) {
      return null;
    }
    contact.is_public = !contact.is_public;
    await contact.save();
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error("Error toggling contact visibility:", error);
    return null;
  }
}
