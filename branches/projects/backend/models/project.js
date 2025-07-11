const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Task sub-schema
const TaskSchema = new Schema({
    taskId: { type: String, required: true },
    taskName: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

// Define the Resource sub-schema
const ResourceSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String }
});

// Define the main Project schema
const ProjectSchema = new Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    companyType: { type: String, required: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    industry: { type: String, required: true },
    projectType: { type: String, required: true },
    preferredSkills: [{ type: String }],
    minExperienceRequired: { type: Number, required: true },
    tasks: [TaskSchema],
    submissionDeadline: { type: Date, required: true },
    difficulty: { type: Number, required: true },
    resources: [ResourceSchema],
    status: { type: String, default: 'active' },
    applicants: { type: Number, default: 0 },
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
}, {
    timestamps: true
});

// Export the Project model
module.exports = mongoose.model('Project', ProjectSchema);