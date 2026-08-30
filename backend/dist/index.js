"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const tasks_js_1 = __importDefault(require("./routes/tasks.js"));
const ai_js_1 = __importDefault(require("./routes/ai.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/tasks', tasks_js_1.default);
app.use('/api/ai', ai_js_1.default);
// Health check
app.get('/', (req, res) => {
    res.json({ message: '11th-Grade War Room API is running' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
