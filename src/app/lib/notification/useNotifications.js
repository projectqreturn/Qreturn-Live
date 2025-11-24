'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  createNotification,
} from './notification';

/**
 * Custom React Hook for managing notifications
 * @param {string} userId - User ID
 * @param {Object} options - Hook options
 * @param {boolean} [options.autoSubscribe] - Auto subscribe to real-time updates
 * @param {boolean} [options.unreadOnly] - Get only unread notifications
 * @returns {Object} - Notification state and methods
 */
export const useNotifications = (userId, { autoSubscribe = true, unreadOnly = false } = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [notifs, count] = await Promise.all([
        getNotifications(userId, { unreadOnly }),
        getUnreadCount(userId),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, unreadOnly]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message);
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(err.message);
    }
  }, [userId]);

  // Delete notification
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.message);
    }
  }, [notifications]);

  // Send notification
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const notifId = await createNotification(notificationData);
      return notifId;
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId || !autoSubscribe) {
      return;
    }

    const unsubscribe = subscribeToNotifications(
      userId,
      (notifs) => {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
        setLoading(false);
      },
      { unreadOnly }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, autoSubscribe, unreadOnly]);

  // Initial fetch if not auto-subscribing
  useEffect(() => {
    if (!autoSubscribe && userId) {
      fetchNotifications();
    }
  }, [autoSubscribe, userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    sendNotification,
    refresh,
  };
};

export default useNotifications;
