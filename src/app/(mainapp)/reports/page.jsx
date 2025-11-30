"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { MdThumbUp, MdThumbUpOffAlt } from "react-icons/md";
import { FaFilter, FaSort } from "react-icons/fa";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const ReportsContent = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const showMyPosts = searchParams.get("myPosts") === "true";
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // active, resolved, dismissed, all
  const [sortBy, setSortBy] = useState("votes"); // votes, recent
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (showMyPosts && !userEmail) return; // Wait for email to load
    fetchReports();
  }, [filter, sortBy, userEmail, showMyPosts]);

  const groupReportsByPost = (reportsList) => {
    const grouped = {};
    
    reportsList.forEach(report => {
      if (!grouped[report.postId]) {
        // First report for this post
        grouped[report.postId] = {
          ...report,
          reasons: [report.reason],
          descriptions: [report.description],
          reportIds: [report._id],
          allUpvotes: report.upvotes || [],
          totalVotes: report.voteCount || 0,
        };
      } else {
        // Add reason if not already present
        if (!grouped[report.postId].reasons.includes(report.reason)) {
          grouped[report.postId].reasons.push(report.reason);
        }
        // Add description if different
        if (!grouped[report.postId].descriptions.includes(report.description)) {
          grouped[report.postId].descriptions.push(report.description);
        }
        // Merge report IDs
        grouped[report.postId].reportIds.push(report._id);
        // Merge upvotes
        grouped[report.postId].allUpvotes = [
          ...new Set([...grouped[report.postId].allUpvotes, ...(report.upvotes || [])])
        ];
        // Sum votes
        grouped[report.postId].totalVotes += report.voteCount || 0;
      }
    });
    
    return Object.values(grouped);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      params.append("sortBy", sortBy);
      
      // Filter by post owner email if viewing "my posts"
      if (showMyPosts && userEmail) {
        params.append("postOwnerEmail", userEmail);
      }

      const res = await fetch(`/api/report?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        // Group reports by postId
        const groupedReports = groupReportsByPost(data.reports || []);
        setReports(groupedReports);
      } else {
        toast.error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (reportId) => {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const res = await fetch("/api/report", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        // Refetch to update grouped data
        fetchReports();
      } else {
        toast.error(data.message || "Failed to vote");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("An error occurred");
    }
  };

  const hasUserUpvoted = (report) => {
    return user && report.allUpvotes && report.allUpvotes.includes(user.id);
  };

  const toggleExpand = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const getReasonColor = (reason) => {
    const colors = {
      Spam: "bg-orange-100 text-orange-800 border-orange-300",
      "Inappropriate Content": "bg-red-100 text-red-800 border-red-300",
      "Misleading Information": "bg-yellow-100 text-yellow-800 border-yellow-300",
      Scam: "bg-rose-100 text-rose-800 border-rose-300",
      "Duplicate Post": "bg-blue-100 text-blue-800 border-blue-300",
      Other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[reason] || colors.Other;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-32 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {showMyPosts ? "Reports About My Posts" : "Reported Posts"}
          </h1>
          <p className="text-gray-400">
            {showMyPosts 
              ? "View reports that have been submitted about your posts by the community."
              : "Community-reported posts that may violate guidelines. Vote on reports to help identify problematic content."}
          </p>
          {showMyPosts && (
            <a
              href="/reports"
              className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              ← View all community reports
            </a>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Reports</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <FaSort className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="votes">Most Voted</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          {/* Stats */}
          <div className="ml-auto text-gray-400">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleUpvote(report.reportIds ? report.reportIds[0] : report._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        hasUserUpvoted(report)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      }`}
                      title={hasUserUpvoted(report) ? "Remove vote" : "Upvote this report"}
                    >
                      {hasUserUpvoted(report) ? (
                        <MdThumbUp size={20} />
                      ) : (
                        <MdThumbUpOffAlt size={20} />
                      )}
                    </button>
                    <span className="text-lg font-bold">{report.totalVotes || report.voteCount}</span>
                    <span className="text-xs text-gray-500">votes</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Post Title and Type */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {report.postTitle}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded border ${
                              report.postType === "lost"
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : "bg-green-100 text-green-800 border-green-300"
                            }`}
                          >
                            {report.postType.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Post ID: {report.postId}
                          </span>
                          {report.reportIds && report.reportIds.length > 1 && (
                            <span className="text-xs text-rose-400">
                              ({report.reportIds.length} reports)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.reasons ? (
                          report.reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-3 py-1 rounded-full border ${getReasonColor(reason)}`}
                            >
                              {reason}
                            </span>
                          ))
                        ) : (
                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${getReasonColor(report.reason)}`}
                          >
                            {report.reason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Preview */}
                    {report.descriptions ? (
                      <div className="mb-3">
                        {report.descriptions.map((desc, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="text-gray-300">
                              {expandedReportId === report._id
                                ? desc
                                : `${desc.substring(0, 150)}${desc.length > 150 ? "..." : ""}`}
                            </p>
                          </div>
                        ))}
                        {report.descriptions.some(d => d.length > 150) && (
                          <button
                            onClick={() => toggleExpand(report._id)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {expandedReportId === report._id ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-300 mb-3">
                          {expandedReportId === report._id
                            ? report.description
                            : `${report.description.substring(0, 150)}${
                                report.description.length > 150 ? "..." : ""
                              }`}
                        </p>
                        {report.description.length > 150 && (
                          <button
                            onClick={() => toggleExpand(report._id)}
                            className="text-blue-400 hover:text-blue-300 text-sm mb-3"
                          >
                            {expandedReportId === report._id ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span>
                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          report.status === "active"
                            ? "bg-yellow-900 text-yellow-300"
                            : report.status === "resolved"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <a
                        href={`/${report.postType}/${report.postId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        View Post
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-400">Loading reports...</div>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
};

export default ReportsPage;
