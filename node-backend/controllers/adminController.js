const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const { Op } = require('sequelize');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { isDeleted: false } });
    const totalNGOs = await User.count({ where: { role: 'NGO', isDeleted: false } });
    const totalGaushalas = await User.count({ where: { role: 'GAUSHALA', isDeleted: false } });
    const totalHotels = await User.count({ where: { role: 'HOTEL', isDeleted: false } });
    const totalHostels = await User.count({ where: { role: 'HOSTEL', isDeleted: false } });
    const totalListings = await FoodListing.count({ where: { isDeleted: false } });
    const pendingUsers = await User.count({ where: { status: 'PENDING', isDeleted: false } });

    res.status(200).json({
      totalUsers,
      totalNGOs,
      totalGaushalas,
      totalHotels,
      totalHostels,
      totalListings,
      pendingUsers
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isDeleted: false };
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      users: rows,
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // SAFETY RULE 5: Admin accounts cannot be modified
    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Modification of ADMIN accounts is restricted' });
    }

    user.status = status;
    if (status === 'ACTIVE') user.isVerified = true;
    
    await user.save();
    res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// PUT /api/admin/users/:id/verify
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // SAFETY RULE 5: Admin accounts cannot be modified
    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Verification status of ADMIN is locked' });
    }

    user.isVerified = true;
    user.status = 'ACTIVE';
    await user.save();

    res.json({ message: 'User verified and activated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

// DELETE /api/admin/users/:id (Fix for soft delete & safety)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // SAFETY RULE 5: Admin accounts cannot be deleted
    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'ADMIN accounts cannot be deleted' });
    }

    // SAFETY RULE 5: Soft delete only
    user.isDeleted = true;
    await user.save();

    res.json({ message: 'User soft-deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// GET /api/admin/listings (FINAL FIX: Correct alias and creators with pagination)
exports.getListings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`Fetching listings (Page: ${page}, Limit: ${limit})...`);
    
    const { count, rows } = await FoodListing.findAndCountAll({
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: 'creator', // Matches association in model
          attributes: ['name', 'role']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      listings: rows,
      totalListings: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Listings API Error:', error);
    res.status(500).json({ error: 'Failed to fetch listings', details: error.message });
  }
};

// GET /api/admin/recent-activity
exports.getRecentActivity = async (req, res) => {
  try {
    const latestUsers = await User.findAll({
      where: { isDeleted: false },
      limit: 5,
      order: [['id', 'DESC']],
      attributes: ['id', 'name', 'role', 'status']
    });

    const latestListings = await FoodListing.findAll({
      where: { isDeleted: false },
      limit: 5,
      order: [['id', 'DESC']],
      attributes: ['id', 'title']
    });

    const activities = [
      ...latestUsers.map(u => ({ id: u.id, type: 'USER', title: u.name, meta: u.role, status: u.status })),
      ...latestListings.map(l => ({ id: l.id, type: 'LISTING', title: l.title, meta: 'New Food Added', status: 'ACTIVE' }))
    ].sort((a, b) => b.id - a.id);

    res.json(activities);
  } catch (error) {
    console.error('Recent Activity Error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
