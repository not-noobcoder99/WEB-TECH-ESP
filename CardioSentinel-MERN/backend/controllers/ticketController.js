const Ticket = require('../models/Ticket');

// POST /api/tickets  (public — no auth required)
const createTicket = async (req, res, next) => {
  try {
    const { name, email, ticketType, subject, message, priority } = req.body;
    if (!name || !email || !ticketType || !message) {
      return res.status(400).json({ message: 'name, email, ticketType, and message are required' });
    }

    const ticket = await Ticket.create({ name, email, ticketType, subject, message, priority });
    res.status(201).json({ message: 'Ticket submitted successfully', ticketId: ticket._id, status: ticket.status });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets  (admin only)
const getTickets = async (req, res, next) => {
  try {
    const { status, ticketType, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (ticketType) filter.ticketType = ticketType;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'fullName')
        .populate('respondedBy', 'fullName'),
      Ticket.countDocuments(filter)
    ]);

    res.json({ tickets, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id
const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('respondedBy', 'fullName');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id
const updateTicket = async (req, res, next) => {
  try {
    const { status, response, priority, assignedTo } = req.body;
    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (assignedTo) update.assignedTo = assignedTo;
    if (response) {
      update.response = response;
      update.respondedBy = req.user.id;
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

module.exports = { createTicket, getTickets, getTicket, updateTicket };
