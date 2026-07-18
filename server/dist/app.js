"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const errors_1 = require("./utils/errors");
const swagger_1 = require("./config/swagger");
// Route Imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const recurring_task_routes_1 = __importDefault(require("./routes/recurring-task.routes"));
const timer_routes_1 = __importDefault(require("./routes/timer.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const statistics_routes_1 = __importDefault(require("./routes/statistics.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const app = (0, express_1.default)();
// 1. Security Headers (Helmet)
app.use((0, helmet_1.default)());
// 2. CORS configurations with credentials/cookies support
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : defaultOrigins;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Enables reading HTTP-Only cookie credentials
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// 3. Rate limiting protection
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 200, // Limit each IP to 200 requests per window
    message: {
        success: false,
        message: 'Too many requests from this IP address. Please try again after 15 minutes.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);
// 4. Morgan HTTP Request logger
app.use(logger_middleware_1.morganMiddleware);
// 5. Body and Cookie Parsers
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
// 6. Swagger API Documentation Page
(0, swagger_1.setupSwagger)(app);
// 7. Core Application Endpoints
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/recurring-tasks', recurring_task_routes_1.default);
app.use('/api/timer', timer_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/statistics', statistics_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
// 8. Catch-all for undefined route paths
app.all('*', (req, res, next) => {
    next(new errors_1.NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
});
// 9. Centralized Error Handler Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map