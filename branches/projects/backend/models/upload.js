const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    fileName: { // Repurposed as project title
        type: String,
        required: [true, 'Project name is required']
    },
    githubLink: {
        type: String,
        required: [true, 'GitHub link is required'],
        match: [/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/, 'Invalid GitHub URL']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Upload', uploadSchema);