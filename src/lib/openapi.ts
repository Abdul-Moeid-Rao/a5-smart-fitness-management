export interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string; description: string }[];
  tags: { name: string; description: string }[];
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
}

export function buildOpenApi(): OpenApiDocument {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const jsonBody = (schemaRef: string) => ({
    required: true,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` },
      },
    },
  });

  const security = [{ BearerAuth: [] as string[] }, { SessionCookie: [] as string[] }];

  const paths: Record<string, unknown> = {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new account",
        security: [],
        requestBody: jsonBody("RegisterRequest"),
        responses: { "200": { description: "Registration successful" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in with email + password",
        security: [],
        requestBody: jsonBody("LoginRequest"),
        responses: { "200": { description: "Login successful, session cookie set" } },
      },
    },
    "/api/auth/sign-out": {
      post: {
        tags: ["Authentication"],
        summary: "Sign out the current session",
        responses: { "200": { description: "Signed out" } },
      },
    },
    "/api/auth/get-session": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current session",
        responses: { "200": { description: "Session payload" } },
      },
    },
    "/api/exercises": {
      get: {
        tags: ["Exercises"],
        summary: "List exercises",
        description: "Public read. Supports pagination, search and sorting.",
        security: [],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "category", "muscleGroup", "difficulty", "createdAt"] } },
          { name: "sortDir", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": { description: "Paginated exercise list", content: { "application/json": { schema: { $ref: "#/components/schemas/Exercise" } } } },
          "429": { description: "Rate limited" },
        },
      },
      post: {
        tags: ["Exercises"],
        summary: "Create an exercise",
        description: "Requires the 'exercises.write' permission (Admin / Trainer).",
        security,
        requestBody: jsonBody("ExerciseInput"),
        responses: { "201": { description: "Exercise created" }, "422": { description: "Validation failed" } },
      },
    },
    "/api/exercises/{id}": {
      get: {
        tags: ["Exercises"],
        summary: "Get a single exercise",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Exercise" }, "404": { description: "Not found" } },
      },
      put: {
        tags: ["Exercises"],
        summary: "Update an exercise",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: jsonBody("ExerciseInput"),
        responses: { "200": { description: "Updated exercise" } },
      },
      delete: {
        tags: ["Exercises"],
        summary: "Delete an exercise",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/api/articles": {
      get: {
        tags: ["Articles"],
        summary: "List articles",
        description: "Public users only see published articles; editors see all statuses.",
        security: [],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } },
        ],
        responses: { "200": { description: "Paginated article list" } },
      },
      post: {
        tags: ["Articles"],
        summary: "Create an article",
        security,
        requestBody: jsonBody("ArticleInput"),
        responses: { "201": { description: "Article created" } },
      },
    },
    "/api/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Get a single article",
        security: [],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Article" }, "404": { description: "Not found" } },
      },
      put: {
        tags: ["Articles"],
        summary: "Update an article",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: jsonBody("ArticleInput"),
        responses: { "200": { description: "Updated article" } },
      },
      delete: {
        tags: ["Articles"],
        summary: "Delete an article",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin — Users"],
        summary: "List all users",
        description: "Requires 'users.read'. Supports search, status/role filters, pagination and sorting.",
        security,
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "suspended"] } },
          { name: "role", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Paginated user list" } },
      },
      delete: {
        tags: ["Admin — Users"],
        summary: "Delete a user",
        description: "Requires 'users.manage'.",
        security,
        requestBody: jsonBody("DeleteUserRequest"),
        responses: { "200": { description: "User deleted" } },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["Admin — Users"],
        summary: "Get a single user with activity summary",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "User" } },
      },
      patch: {
        tags: ["Admin — Users"],
        summary: "Update a user (role, status, plan, profile)",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: jsonBody("UserUpdate"),
        responses: { "200": { description: "Updated user" } },
      },
      delete: {
        tags: ["Admin — Users"],
        summary: "Delete a user",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "User deleted" } },
      },
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin — Analytics"],
        summary: "Site-wide dashboard statistics",
        description: "KPIs, role distribution, 30-day growth, session and activity series.",
        security,
        responses: { "200": { description: "Dashboard data" } },
      },
    },
    "/api/admin/reports": {
      get: {
        tags: ["Admin — Analytics"],
        summary: "Analytics & reports",
        description: "6-month signup series, distributions, top actions and recent audit events.",
        security,
        responses: { "200": { description: "Report data" } },
      },
    },
    "/api/admin/audit-logs": {
      get: {
        tags: ["Admin — Analytics"],
        summary: "List audit log entries",
        description: "Requires 'audit.read'.",
        security,
        parameters: [{ name: "page", in: "query", schema: { type: "integer", default: 1 } }, { name: "pageSize", in: "query", schema: { type: "integer", default: 25 } }],
        responses: { "200": { description: "Paginated audit log" } },
      },
    },
    "/api/roles": {
      get: {
        tags: ["Access — Roles"],
        summary: "List roles with their permissions",
        security,
        responses: { "200": { description: "Roles and permissions" } },
      },
      post: {
        tags: ["Access — Roles"],
        summary: "Create a custom role",
        security,
        requestBody: jsonBody("CreateRoleRequest"),
        responses: { "201": { description: "Role created" } },
      },
    },
    "/api/roles/{id}": {
      put: {
        tags: ["Access — Roles"],
        summary: "Update role description and permissions",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: jsonBody("RoleUpdate"),
        responses: { "200": { description: "Role updated" } },
      },
      delete: {
        tags: ["Access — Roles"],
        summary: "Delete a non-system role",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Role deleted" } },
      },
    },
    "/api/apikeys": {
      get: {
        tags: ["Access — API Keys"],
        summary: "List your API keys",
        security,
        responses: { "200": { description: "API keys (masked)" } },
      },
      post: {
        tags: ["Access — API Keys"],
        summary: "Create an API key",
        description: "Returns the raw key once — store it securely.",
        security,
        requestBody: jsonBody("ApiKeyInput"),
        responses: { "201": { description: "API key created with raw value" } },
      },
    },
    "/api/apikeys/{id}": {
      delete: {
        tags: ["Access — API Keys"],
        summary: "Revoke an API key",
        security,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "API key revoked" } },
      },
    },
    "/api/upload": {
      post: {
        tags: ["Misc"],
        summary: "Upload an image (thumbnail / cover)",
        description: "Multipart form field named 'file'. Max 2MB, JPEG/PNG/WEBP/GIF.",
        security,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
            },
          },
        },
        responses: { "200": { description: "Returns the public URL of the uploaded file" } },
      },
    },
  };

  return {
    openapi: "3.0.3",
    info: {
      title: "Smart Fitness Management — REST API",
      version: "1.0.0",
      description:
        "REST API for the Smart Fitness Management platform.\n\n" +
        "**Authentication** — create a session via `POST /api/auth/login` (a cookie is set) or pass a `Authorization: Bearer <token>` header.\n\n" +
        "**RBAC** — routes are protected by role (Admin / Trainer / User) and fine-grained permissions.\n\n" +
        "**Security** — every route is rate limited, request bodies are validated with Zod, and all state-changing operations are recorded in the audit log.",
    },
    servers: [
      { url: baseUrl, description: "Current environment" },
      { url: "http://localhost:3000", description: "Local development" },
    ],
    tags: [
      { name: "Authentication", description: "Sign-up, sign-in and session management" },
      { name: "Exercises", description: "Exercise library CRUD" },
      { name: "Articles", description: "Article content CRUD" },
      { name: "Admin — Users", description: "User management endpoints (Admin / Trainer)" },
      { name: "Admin — Analytics", description: "Statistics, reports and audit log" },
      { name: "Access — Roles", description: "Role and permission management" },
      { name: "Access — API Keys", description: "API key management" },
      { name: "Misc", description: "File uploads and utilities" },
    ],
    paths,
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        SessionCookie: { type: "apiKey", in: "cookie", name: "better-auth.session_token" },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
        },
        ExerciseInput: {
          type: "object",
          required: ["name", "slug", "category", "muscleGroup", "description", "instructions"],
          properties: {
            name: { type: "string" },
            slug: { type: "string" },
            category: { type: "string" },
            muscleGroup: { type: "string" },
            difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            equipment: { type: "string" },
            description: { type: "string" },
            instructions: { type: "string" },
            imageUrl: { type: "string" },
            isPublished: { type: "boolean", default: true },
          },
        },
        Exercise: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
        ArticleInput: {
          type: "object",
          required: ["title", "slug", "content"],
          properties: {
            title: { type: "string" },
            slug: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
            coverImage: { type: "string" },
            status: { type: "string", enum: ["draft", "published", "archived"] },
            tags: { type: "array", items: { type: "string" } },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            bio: { type: "string" },
            role: { type: "string" },
            status: { type: "string", enum: ["active", "suspended"] },
            plan: { type: "string", enum: ["free", "pro", "elite"] },
          },
        },
        DeleteUserRequest: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
        CreateRoleRequest: { type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" } } },
        RoleUpdate: { type: "object", properties: { description: { type: "string" }, permissions: { type: "array", items: { type: "string" } } } },
        ApiKeyInput: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string" }, permissions: { type: "array", items: { type: "string" } }, expiresAt: { type: "string", format: "date-time" } },
        },
      },
    },
  };
}
