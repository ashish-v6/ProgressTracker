"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const setup_1 = require("./setup");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
describe('User Model Unit Tests', () => {
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
    });
    it('should skip password hashing if password is not modified', async () => {
        const user = await user_model_1.User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        user.username = 'newusername';
        await user.save();
        expect(user.username).toBe('newusername');
    });
    it('should call next with error if bcrypt fails', async () => {
        jest.spyOn(bcryptjs_1.default, 'genSalt').mockRejectedValueOnce(new Error('bcrypt error'));
        const user = new user_model_1.User({
            username: 'testuser2',
            email: 'test2@example.com',
            password: 'password123'
        });
        await expect(user.save()).rejects.toThrow('bcrypt error');
        jest.restoreAllMocks();
    });
});
//# sourceMappingURL=user-model.test.js.map