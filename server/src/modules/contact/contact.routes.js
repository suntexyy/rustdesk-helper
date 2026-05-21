const express = require("express");

const router = express.Router();

const { protectAdmin } = require("../auth/auth.middleware");

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  bulkUpdateContactStatus,
  deleteContact,
} = require("./contact.controller");

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form submissions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactInput:
 *       type: object
 *       required:
 *         - name
 *         - lastName
 *         - email
 *         - phone
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 20
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 1
 *           maxLength: 25
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         phone:
 *           type: string
 *           pattern: '^\d{9}$'
 *           example: "123456789"
 *         message:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *           example: Hello, I would like to get in touch.
 *
 *     Contact:
 *       allOf:
 *         - $ref: '#/components/schemas/ContactInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 64f1a2b3c4d5e6f7a8b9c0d1
 *             status:
 *               type: string
 *               enum: [unread, read, replied]
 *               default: unread
 *               example: unread
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: 2024-01-15T10:30:00.000Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: 2024-01-15T10:30:00.000Z
 *
 *     ContactStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [unread, read, replied]
 *           example: read
 *
 *     PaginatedContacts:
 *       type: object
 *       properties:
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Contact'
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactInput'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Your message has been sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", createContact);

// Protected admin routes
router.use(protectAdmin);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact submissions (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read, replied]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Paginated list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedContacts'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllContacts);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get a single contact by ID (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact document ID
 *     responses:
 *       200:
 *         description: Contact found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// bulk status endpoint must come before the `/:id` route otherwise `status`
// would be interpreted as an id parameter
router.patch("/status/bulk", bulkUpdateContactStatus);

router.get("/:id", getContactById);

/**
 * @swagger
 * /api/contact/status/bulk:
 *   patch:
 *     summary: Bulk update status on multiple contacts (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - status
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 $ref: '#/components/schemas/ContactStatusUpdate'
 *     responses:
 *       200:
 *         description: Contacts updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     modified:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/contact/{id}/status:
 *   patch:
 *     summary: Update contact status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactStatusUpdate'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/status", updateContactStatus);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a contact (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact document ID
 *     responses:
 *       204:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteContact);

module.exports = router;
