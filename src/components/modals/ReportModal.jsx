import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, postData, userEmail, userId, postOwnerEmail }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Spam',
    'Inappropriate Content',
    'Misleading Information',
    'Scam',
    'Duplicate Post',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reporterId: userId,
        reporterEmail: userEmail,
        postId: String(postData.postId), // Convert to string
        postType: postData.postType,
        postTitle: postData.title,
        postOwnerEmail: postOwnerEmail || postData.ownerEmail,
        reason: selectedReason,
        description: description.trim(),
      };

      console.log('Submitting report:', reportData);

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const data = await res.json();
      console.log('API Response:', res.status, data);

      if (res.ok) {
        toast.success(data.message || 'Report submitted successfully');
        setSelectedReason('');
        setDescription('');
        onClose();
      } else {
        console.error('Report submission failed:', data);
        if (res.status === 409) {
          toast.error('You have already reported this post');
        } else {
          toast.error(data.message || 'Failed to submit report');
        }
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  // Safety check for required props
  if (!postData || !userId || !userEmail) {
    console.error('Missing required props:', { postData, userId, userEmail });
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Report Post</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Post Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Reporting:</p>
            <p className="font-semibold text-gray-900">{postData.title}</p>
            <p className="text-xs text-gray-500 mt-1">Post ID: {postData.postId}</p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="ml-3 text-gray-900">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Please provide more details about why you're reporting this post..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none text-gray-900"
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters (minimum 10)
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> False reports may result in account suspension. 
              Please only report content that violates our community guidelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedReason || description.length < 10}
              className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
