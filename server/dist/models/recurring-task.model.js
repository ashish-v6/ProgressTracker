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
exports.RecurringTask = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RecurringTaskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
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
        trim: true
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true
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
            values: ['active', 'paused'],
            message: 'Status must be active or paused'
        },
        default: 'active',
        index: true
    },
    targetHours: {
        type: Number,
        required: [true, 'Target hours is required'],
        min: [0, 'Target hours cannot be negative']
    },
    targetMinutes: {
        type: Number,
        required: [true, 'Target minutes is required'],
        min: [0, 'Target minutes cannot be negative'],
        max: [59, 'Target minutes cannot exceed 59']
    },
    repeatRule: {
        type: String,
        enum: {
            values: ['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'custom'],
            message: 'Repeat rule must be daily, weekdays, weekends, weekly, monthly, or custom'
        },
        required: [true, 'Repeat rule is required']
    },
    repeatDays: {
        type: [Number],
        default: []
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
    }
}, {
    timestamps: true
});
// Optimize query searches for generating tasks
RecurringTaskSchema.index({ createdBy: 1, status: 1 });
exports.RecurringTask = mongoose_1.default.model('RecurringTask', RecurringTaskSchema);
exports.default = exports.RecurringTask;
//# sourceMappingURL=recurring-task.model.js.map