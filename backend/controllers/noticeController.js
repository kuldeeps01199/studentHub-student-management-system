const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate('postedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Admin, Teacher)
const createNotice = async (req, res) => {
    const { title, category, content } = req.body;
    try {
        const notice = new Notice({
            title,
            category,
            content,
            postedBy: req.user._id,
        });

        const createdNotice = await notice.save();
        await createdNotice.populate('postedBy', 'name role');
        res.status(201).json(createdNotice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, Teacher)
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (notice) {
            await notice.deleteOne();
            res.json({ message: 'Notice removed' });
        } else {
            res.status(404).json({ message: 'Notice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotices,
    createNotice,
    deleteNotice,
};
