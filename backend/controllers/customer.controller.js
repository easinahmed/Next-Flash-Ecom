const User = require('../models/User');

const getAllCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, address } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: 'fullName and email are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ fullName, email, phone, address, role: 'customer' });
    await user.save();
    const toReturn = user.toObject();
    delete toReturn.password;
    res.status(201).json(toReturn);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create customer' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const { fullName, email, phone, address, password } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) user.password = password; // will be hashed via pre-save
    await user.save();
    const toReturn = user.toObject();
    delete toReturn.password;
    res.json(toReturn);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const { isActive } = req.body;
    if (typeof isActive === 'undefined') return res.status(400).json({ message: 'isActive required' });
    user.isActive = Boolean(isActive);
    await user.save();
    const toReturn = user.toObject();
    delete toReturn.password;
    res.json(toReturn);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer status' });
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, updateCustomerStatus };
