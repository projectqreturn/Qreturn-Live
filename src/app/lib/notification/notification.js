import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  deleteDoc,
  getDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/firebase.config';

/**
 * Notification Library for Qreturn
 * Manages push notifications using Firebase Firestore
 */

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  ITEM_FOUND: 'item_found',
  ITEM_LOST: 'item_lost',
  MATCH_FOUND: 'match_found',
  MESSAGE: 'message',
  SYSTEM: 'system',
  QR_SCAN: 'qr_scan',
  ITEM_CLAIMED: 'item_claimed',
  VERIFICATION: 'verification',
};

/**
 * Create a new notification
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.userId - User ID to send notification to
 * @param {string} notificationData.type - Type of notification (use NOTIFICATION_TYPES)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {Object} [notificationData.data] - Additional data (itemId, postId, etc.)
 * @param {string} [notificationData.link] - Link to navigate when clicked
 * @param {string} [notificationData.priority] - Priority level (high, medium, low)
 * @returns {Promise<string>} - The created notification ID
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  link = null,
  priority = 'medium'
}) => {
  try {
    if (!userId || !type || !title || !message) {
      throw new Error('Missing required notification fields');
    }

    const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      userId,
      type,
      title,
      message,
      data,
      link,
      priority,
      read: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} [options.limitCount] - Maximum number of notifications to retrieve
 * @param {boolean} [options.unreadOnly] - Get only unread notifications
 * @returns {Promise<Array>} - Array of notifications
 */
export const getNotifications = async (userId, { limitCount = 50, unreadOnly = false } = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    let q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markAsRead = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark multiple notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @returns {Promise<void>}
 */
export const markMultipleAsRead = async (notificationIds) => {
  try {
    if (!notificationIds || notificationIds.length === 0) {
      throw new Error('Notification IDs are required');
    }

    const updatePromises = notificationIds.map((id) => 
      updateDoc(doc(db, NOTIFICATIONS_COLLECTION, id), {
        read: true,
        updatedAt: Timestamp.now(),
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking multiple notifications as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = [];

    querySnapshot.forEach((document) => {
      updatePromises.push(
        updateDoc(doc(db, NOTIFICATIONS_COLLECTION, document.id), {
          read: true,
          updatedAt: Timestamp.now(),
        })
      );
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = [];

    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, document.id)));
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Get a single notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object|null>} - Notification object or null
 */
export const getNotificationById = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (notificationSnap.exists()) {
      return {
        id: notificationSnap.id,
        ...notificationSnap.data(),
        createdAt: notificationSnap.data().createdAt?.toDate(),
        updatedAt: notificationSnap.data().updatedAt?.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting notification by ID:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time notification updates for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle notifications
 * @param {Object} options - Query options
 * @param {boolean} [options.unreadOnly] - Listen only to unread notifications
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback, { unreadOnly = false } = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    let q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        });
      });
      callback(notifications);
    }, (error) => {
      console.error('Error in notification subscription:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    throw error;
  }
};

/**
 * Get notifications by type
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {number} [limitCount] - Maximum number of notifications
 * @returns {Promise<Array>} - Array of notifications
 */
export const getNotificationsByType = async (userId, type, limitCount = 50) => {
  try {
    if (!userId || !type) {
      throw new Error('User ID and type are required');
    }

    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications by type:', error);
    throw error;
  }
};

/**
 * Bulk create notifications for multiple users
 * @param {Array<Object>} notificationsData - Array of notification objects
 * @returns {Promise<Array<string>>} - Array of created notification IDs
 */
export const bulkCreateNotifications = async (notificationsData) => {
  try {
    if (!notificationsData || notificationsData.length === 0) {
      throw new Error('Notifications data is required');
    }

    const createPromises = notificationsData.map((notification) =>
      createNotification(notification)
    );

    return await Promise.all(createPromises);
  } catch (error) {
    console.error('Error bulk creating notifications:', error);
    throw error;
  }
};

/**
 * Helper function to create item match notification
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {string} itemName - Item name
 * @param {string} matchType - Type of match (found/lost)
 * @returns {Promise<string>} - Notification ID
 */
export const notifyItemMatch = async (userId, itemId, itemName, matchType) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.MATCH_FOUND,
    title: 'Potential Match Found!',
    message: `We found a potential match for your ${matchType} item: ${itemName}`,
    data: { itemId, matchType },
    link: `/myitems`,
    priority: 'high'
  });
};

/**
 * Helper function to create QR scan notification
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {string} location - Scan location
 * @returns {Promise<string>} - Notification ID
 */
export const notifyQRScan = async (userId, itemId, location) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.QR_SCAN,
    title: 'Your Item Was Scanned!',
    message: `Someone scanned your QR code at ${location}`,
    data: { itemId, location },
    link: `/protectedqr/${itemId}`,
    priority: 'high'
  });
};

/**
 * Helper function to create message notification
 * @param {string} userId - User ID
 * @param {string} senderName - Sender's name
 * @param {string} messagePreview - Message preview
 * @param {string} chatId - Chat ID
 * @returns {Promise<string>} - Notification ID
 */
export const notifyNewMessage = async (userId, senderName, messagePreview, chatId) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: `New message from ${senderName}`,
    message: messagePreview,
    data: { chatId, senderName },
    link: `/chats/${chatId}`,
    priority: 'medium'
  });
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
  subscribeToNotifications,
  getNotificationsByType,
  bulkCreateNotifications,
  notifyItemMatch,
  notifyQRScan,
  notifyNewMessage,
  NOTIFICATION_TYPES,
};
