"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRepository = exports.RefreshTokenRepository = void 0;
const refresh_token_model_1 = require("../models/refresh-token.model");
const base_repository_1 = require("./base.repository");
class RefreshTokenRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(refresh_token_model_1.RefreshToken);
    }
    async findByToken(token) {
        return this.model.findOne({ token }).populate('userId').exec();
    }
    async revokeAllForUser(userId) {
        await this.model.updateMany({ userId, revoked: false }, { $set: { revoked: true } }).exec();
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.refreshTokenRepository = new RefreshTokenRepository();
exports.default = exports.refreshTokenRepository;
//# sourceMappingURL=refresh-token.repository.js.map