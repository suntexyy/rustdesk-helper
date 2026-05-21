const contactService = require("./contact.service");
const { contactSchema } = require("./contact.validation");
const AppError = require("../../utils/AppError");

const createContact = async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Validation failed";
      return next(new AppError(message, 400));
    }

    const contact = await contactService.createContact(parsed.data);

    res.status(201).json({
      status: "success",
      message: "Your message has been sent successfully",
      data: { contact },
    });
  } catch (err) {
    next(err);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await contactService.getAllContacts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactService.getContactById(req.params.id);

    res.status(200).json({
      status: "success",
      data: { contact },
    });
  } catch (err) {
    next(err);
  }
};

const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["unread", "read", "replied"];
    if (!validStatuses.includes(status)) {
      return next(
        new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400),
      );
    }

    const contact = await contactService.updateContactStatus(
      req.params.id,
      status,
    );

    res.status(200).json({
      status: "success",
      data: { contact },
    });
  } catch (err) {
    next(err);
  }
};

// bulk update by sending array of ids and a status value
const bulkUpdateContactStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const validStatuses = ["unread", "read", "replied"];
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("`ids` must be a non-empty array", 400));
    }
    if (!validStatuses.includes(status)) {
      return next(
        new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400),
      );
    }

    const result = await contactService.updateContactsStatus(ids, status);
    // result contains { acknowledged, modifiedCount, ... }

    res.status(200).json({
      status: "success",
      data: { modified: result.modifiedCount },
    });
  } catch (err) {
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await contactService.deleteContact(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  bulkUpdateContactStatus,
};
