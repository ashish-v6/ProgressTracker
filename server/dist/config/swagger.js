"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Progress Tracker REST API Documentation',
            version: '1.0.0',
            description: 'Production-ready, type-safe REST API for the Progress Tracker Application',
            contact: {
                name: 'Engineering Team'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Access JWT token to access protected endpoints.'
                }
            }
        }
    },
    // Parse comments in both development ts files and compiled dist folder js files
    apis: ['./src/routes/*.ts', './src/routes/*.js', './dist/routes/*.js']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
exports.default = exports.setupSwagger;
//# sourceMappingURL=swagger.js.map