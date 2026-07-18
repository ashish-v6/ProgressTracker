"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const refresh_token_model_1 = require("../models/refresh-token.model");
const setup_1 = require("./setup");
describe('RefreshToken Model Virtuals Tests', () => {
    beforeEach(async () => {
        await (0, setup_1.clearDatabase)();
    });
    it('should compute virtual properties isExpired and isActive correctly', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const activeToken = new refresh_token_model_1.RefreshToken({
            token: 'some_active_token',
            userId: new mongoose_1.default.Types.ObjectId(),
            expiresAt: futureDate,
            revoked: false
        });
        expect(activeToken.isExpired).toBe(false);
        expect(activeToken.isActive).toBe(true);
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 1);
        const expiredToken = new refresh_token_model_1.RefreshToken({
            token: 'some_expired_token',
            userId: new mongoose_1.default.Types.ObjectId(),
            expiresAt: expiredDate,
            revoked: false
        });
        expect(expiredToken.isExpired).toBe(true);
        expect(expiredToken.isActive).toBe(false);
        const revokedToken = new refresh_token_model_1.RefreshToken({
            token: 'some_revoked_token',
            userId: new mongoose_1.default.Types.ObjectId(),
            expiresAt: futureDate,
            revoked: true
        });
        expect(revokedToken.isActive).toBe(false);
    });
});
//# sourceMappingURL=refresh-token-model.test.js.map