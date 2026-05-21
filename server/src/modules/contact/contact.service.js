const Contact = require("./contact.model");
const AppError = require("../../utils/AppError");

const createContact = async (data) => {
  const contact = await Contact.create(data);
  return contact;
};

const getAllContacts = async ({ page = 1, limit = 20, status } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  return {
    contacts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getContactById = async (id) => {
  const contact = await Contact.findById(id);
  if (!contact) throw new AppError("Contact not found", 404);
  return contact;
};

const updateContactStatus = async (id, status) => {
  const contact = await Contact.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: "after", runValidators: true },
  );
  if (!contact) throw new AppError("Contact not found", 404);
  return contact;
};

// bulk status update
const updateContactsStatus = async (ids, status) => {
  if (!Array.isArray(ids) || ids.length === 0) return { modifiedCount: 0 };
  const result = await Contact.updateMany({ _id: { $in: ids } }, { status });
  return result;
};

const deleteContact = async (id) => {
  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) throw new AppError("Contact not found", 404);
  return contact;
};
module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  updateContactsStatus,
  deleteContact,
};
