"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const user_model_1 = require("../models/user.model");
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(user_model_1.User);
    }
    async findByEmail(email, selectPassword = false) {
        const query = this.model.findOne({ email: email.toLowerCase() });
        if (selectPassword) {
            query.select('+password');
        }
        return query.exec();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
exports.default = exports.userRepository;
//# sourceMappingURL=user.repository.js.map