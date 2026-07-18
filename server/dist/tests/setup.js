"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_1234567890';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_1234567890';
process.env.PORT = '5001';
const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/progresstracker_test';
beforeAll(async () => {
    // Gracefully close any existing connection before starting
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.connection.close();
    }
    await mongoose_1.default.connect(MONGODB_URI);
});
afterAll(async () => {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.connection.close();
    }
});
const clearDatabase = async () => {
    if (mongoose_1.default.connection.readyState !== 0) {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
};
exports.clearDatabase = clearDatabase;
//# sourceMappingURL=setup.js.map