"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TaskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        default: 'General'
    },
    color: {
        type: String,
        trim: true,
        default: '#4F46E5' // Indigo default
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Priority must be low, medium, or high'
        },
        default: 'medium'
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in_progress', 'completed'],
            message: 'Status must be pending, in_progress, or completed'
        },
        default: 'pending',
        index: true
    },
    targetHours: {
        type: Number,
        default: 0,
        min: [0, 'Target hours cannot be negative']
    },
    targetMinutes: {
        type: Number,
        default: 0,
        min: [0, 'Target minutes cannot be negative'],
        max: [59, 'Target minutes cannot exceed 59']
    },
    actualHours: {
        type: Number,
        default: 0,
        min: [0, 'Actual hours cannot be negative']
    },
    actualMinutes: {
        type: Number,
        default: 0,
        min: [0, 'Actual minutes cannot be negative']
    },
    completed: {
        type: Boolean,
        default: false
    },
    repeatRule: {
        type: String,
        enum: ['none', 'daily', 'weekdays', 'weekends', 'weekly', 'custom'],
        default: 'none'
    },
    repeatDays: {
        type: [Number],
        default: []
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
        index: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RecurringTask',
        default: null,
        index: true
    }
}, {
    timestamps: true
});
// Indexes for compound searches and filtering
TaskSchema.index({ createdBy: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ createdBy: 1, completed: 1 });
exports.Task = mongoose_1.default.model('Task', TaskSchema);
exports.default = exports.Task;
//# sourceMappingURL=task.model.js.map