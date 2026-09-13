const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Subject = require('./models/Subject');

dotenv.config();

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let courses = await Course.find();
        if (courses.length === 0) {
            courses = await Course.insertMany([
                { name: 'BCA', description: 'Bachelor of Computer Applications' },
                { name: 'B.Tech', description: 'Bachelor of Technology' },
                { name: 'MBA', description: 'Master of Business Administration' },
                { name: 'MCA', description: 'Master of Computer Applications' },
            ]);
            console.log('Courses seeded!');
        }

        const bcaCourse = courses.find(c => c.name === 'BCA');
        if (bcaCourse) {
            const subjectCount = await Subject.countDocuments({ course: bcaCourse._id });
            if (subjectCount === 0) {
                await Subject.insertMany([
                    { name: 'Mathematics', code: 'BCA101', course: bcaCourse._id, semester: 'Semester 1' },
                    { name: 'Programming in C', code: 'BCA102', course: bcaCourse._id, semester: 'Semester 1' },
                    { name: 'Database Management Systems', code: 'BCA103', course: bcaCourse._id, semester: 'Semester 2' },
                    { name: 'Computer Networking', code: 'BCA104', course: bcaCourse._id, semester: 'Semester 2' },
                ]);
                console.log('BCA Subjects (Mathematics, Programming, Database, Networking) seeded!');
            }
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedCourses();
