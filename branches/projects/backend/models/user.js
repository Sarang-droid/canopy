const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: '',
    },
    school: {
        type: String,
        default: '',
    },
    education: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png',
    },
    password: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    badges: [{
        type: String,
    }],
    skills: [{
        type: String,  // Store skills as an array
    }],
    interests: [{
        type: String,  // Store interests as an array
    }],
    degree: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    completedProjects: [{
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: false,
        },
        projectName: {
            type: String,
            required: true,
        },
        submissionDate: {
            type: Date,
            required: true,
        },
        difficulty: {
            type: Number,  // Scale of 1-10, determines expertise level
            min: 1,
            max: 10,
        },
        completionTime: {
            type: Number,  // Time taken in hours/days
        },
    }],
    refreshToken: {
        type: String,
        default: null,
    },
    engagementScore: {
        type: Number,
        default: 0,  // Tracks user activity and consistency
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
    },
    // New Fields for Matchmaking
    mbti: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MBTI',
    },
    preferredProjectTypes: [{
        type: String,
        enum: ['Research', 'Internship', 'Freelance', 'Contract', 'Full-time'],
    }],
    preferredIndustries: [{
        type: String,
        enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'IT Services', 'Fintech'],
    }],
    isGoogleUser: { type: Boolean, default: false },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    github: { type: String, default: '' },
});

// Export the User model
module.exports = mongoose.model('User', userSchema);