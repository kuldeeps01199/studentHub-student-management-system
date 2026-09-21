const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);

// Serve frontend static build assets in production if hosted together
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(frontendDistPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('StudentHub API is running...');
    });
}

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Keep-Alive Self-Ping Heartbeat to prevent Render Free Tier from sleeping (every 14 mins)
const https = require('https');
const http = require('http');

setInterval(() => {
    const liveUrl = process.env.LIVE_SITE_URL || 'https://studenthub-student-management-system.onrender.com/api/auth/admin-exists';
    if (liveUrl) {
        const client = liveUrl.startsWith('https') ? https : http;
        client.get(liveUrl, (res) => {
            console.log(`[Keep-Alive Heartbeat] Server pinged successfully (${res.statusCode}) - Sleep prevented.`);
        }).on('error', (err) => {
            console.log(`[Keep-Alive Heartbeat] Notice: ${err.message}`);
        });
    }
}, 14 * 60 * 1000); // 14 minutes
