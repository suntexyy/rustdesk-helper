const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "rustdesk-helper Dictionary API",
      version: "1.0.0",
      description:
        "Backend API for the Online Dictionary of Georgian A1 Level Verbs",
      contact: {
        name: "rustdesk-helper Team",
        email: "admin@rustdesk-helper.ge",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.rustdesk-helper.ge",
        description: "Production server",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "HTTP-only JWT access token cookie set on login",
        },

        // ✅ (optional but recommended თუ ოდესმე bearer გამოიყენე)
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        // ── Reusable response schemas ──
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error description" },
          },
        },

        AdminProfile: {
          type: "object",
          properties: {
            id: { type: "string", example: "6876f3a2b1c4d5e6f7890abc" },
            name: { type: "string", example: "Super Admin" },
            email: { type: "string", example: "admin@rustdesk-helper.ge" },
            role: { type: "string", enum: ["superadmin", "editor"] },
            isActive: { type: "boolean", example: true },
            lastLogin: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },

    // ✅ UPDATED TAGS
    tags: [
      { name: "Auth", description: "Admin authentication endpoints" },
      { name: "Contact", description: "Contact form submissions" },
      { name: "Category", description: "Category management" }, // 🔥 NEW
      { name: "Health", description: "Server health check" },
    ],
  },

  // ✅ UPDATED APIS (IMPORTANT PART)
  apis: [
    "./src/modules/auth/auth.routes.js",
    "./src/modules/contact/contact.routes.js",
    "./src/modules/category/category.routes.js", // 🔥 MUST ADD
    "./src/server.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
