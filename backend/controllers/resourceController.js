const Resource = require('../models/Resource');

// @desc    Add Career Resource
// @route   POST /api/resources
// @access  Private (Alumni, Admin)
const addResource = async (req, res) => {
  try {
    const { title, description, category, externalUrl, fileType } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const resource = await Resource.create({
      title,
      description,
      category: category || 'Career Guide',
      fileUrl,
      externalUrl: externalUrl || '',
      fileType: fileType || (req.file ? req.file.originalname.split('.').pop().toUpperCase() : 'PDF'),
      uploadedBy: req.user._id
    });

    res.status(201).json({ message: 'Resource shared successfully', resource });
  } catch (error) {
    console.error('Add Resource Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Career Resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    let resources = await Resource.find(query)
      .populate('uploadedBy', 'name email role avatar')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      resources = resources.filter(r =>
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s)
      );
    }

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Resource
// @route   DELETE /api/resources/:id
// @access  Private (Uploader, Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addResource,
  getResources,
  deleteResource
};
