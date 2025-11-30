import { NextResponse } from "next/server";
import { connect } from "../../lib/db";
import ReportPost from "../../lib/modals/reportPost.modal";

// POST - Create a new report
export async function POST(req) {
  try {
    await connect();
    
    const data = await req.json();
    console.log("Received report data:", data);

    // Validate required fields
    const { reporterId, reporterEmail, postId, postType, postTitle, postOwnerEmail, reason, description } = data;

    if (!reporterId || !reporterEmail || !postId || !postType || !postTitle || !postOwnerEmail || !reason || !description) {
      return NextResponse.json(
        { 
          message: "Missing required fields",
          missingFields: {
            reporterId: !reporterId,
            reporterEmail: !reporterEmail,
            postId: !postId,
            postType: !postType,
            postTitle: !postTitle,
            postOwnerEmail: !postOwnerEmail,
            reason: !reason,
            description: !description,
          }
        },
        { status: 400 }
      );
    }

    // Check if user has already reported this post
    const existingReport = await ReportPost.findOne({
      reporterId,
      postId,
    });

    if (existingReport) {
      return NextResponse.json(
        { message: "You have already reported this post." },
        { status: 409 }
      );
    }

    // Create new report
    const newReport = await ReportPost.create({
      reporterId,
      reporterEmail,
      postId,
      postType,
      postTitle,
      postOwnerEmail,
      reason,
      description,
      upvotes: [reporterId], // Reporter automatically upvotes their own report
      voteCount: 1,
      status: 'active',
    });

    console.log("Report created successfully:", newReport);

    return NextResponse.json(
      { 
        message: "Report submitted successfully. We will review it shortly.",
        report: newReport 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "Failed to submit report", error: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve reports (for admin panel)
export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const postId = searchParams.get("postId");
    const reporterId = searchParams.get("reporterId");
    const postOwnerEmail = searchParams.get("postOwnerEmail");
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, votes

    let query = {};
    
    if (status) query.status = status;
    if (postId) query.postId = postId;
    if (reporterId) query.reporterId = reporterId;
    if (postOwnerEmail) query.postOwnerEmail = postOwnerEmail;

    let sortOptions = { createdAt: -1 }; // Default: most recent
    if (sortBy === "votes") {
      sortOptions = { voteCount: -1, createdAt: -1 }; // Most voted, then recent
    }

    const reports = await ReportPost.find(query)
      .sort(sortOptions)
      .limit(100);

    return NextResponse.json(
      { reports, count: reports.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Upvote a report
export async function PUT(req) {
  try {
    await connect();

    const data = await req.json();
    const { reportId, userId } = data;

    if (!reportId || !userId) {
      return NextResponse.json(
        { message: "Missing reportId or userId" },
        { status: 400 }
      );
    }

    const report = await ReportPost.findById(reportId);

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    // Check if user already upvoted
    const hasUpvoted = report.upvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      report.upvotes = report.upvotes.filter(id => id !== userId);
      report.voteCount = report.upvotes.length;
      await report.save();

      return NextResponse.json(
        { message: "Upvote removed", voteCount: report.voteCount, hasUpvoted: false },
        { status: 200 }
      );
    } else {
      // Add upvote
      report.upvotes.push(userId);
      report.voteCount = report.upvotes.length;
      await report.save();

      return NextResponse.json(
        { message: "Upvoted successfully", voteCount: report.voteCount, hasUpvoted: true },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error upvoting report:", error);
    return NextResponse.json(
      { message: "Failed to upvote report", error: error.message },
      { status: 500 }
    );
  }
}
