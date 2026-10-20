const Job = require('../models/Job.model');

// ─── CREATE JOB ───────────────────────────────────────────────────────────

const createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      job
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET ALL JOBS WITH FILTERS ────────────────────────────────────────────

const getJobs = async (req, res) => {
  try {
    const {
      location,
      type,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (location) filter.location = new RegExp(location, 'i');
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── APPLY FOR JOB ────────────────────────────────────────────────────────

const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(
      (applicant) =>
        applicant.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'Already applied for this job'
      });
    }

    job.applicants.push({ user: req.user._id });
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── DELETE JOB ───────────────────────────────────────────────────────────

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only job poster can delete
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  applyForJob,
  deleteJob
};