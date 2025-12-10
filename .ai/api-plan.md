# REST API Plan - Requil

## 1. Resources

### Core Resources
- **Workspaces** (`workspaces`) - Multi-tenant workspace management
- **Workspace Members** (`workspace_members`) - User membership and roles
- **Workspace Invitations** (`workspace_invitations`) - Invitation management
- **API Keys** (`api_keys`, `api_key_scopes`) - Authentication credentials with scopes
- **Templates** (`templates`, `template_snapshots`) - Email template versioning with builder JSON structure (rendered via React Email)
- **Brand Kit** (`workspace_brandkit`) - Workspace branding configuration
- **Transports** (`workspace_transports`) - Email delivery configuration (Resend/SMTP)
- **Send Jobs** (`send_jobs`, `send_recipients`) - Email sending orchestration
- **Subscribers** (`subscribers`, `subscriber_tags`) - Newsletter subscriber management
- **Suppression List** (`suppression`) - Bounce and unsubscribe management
- **Events** (`events`) - Delivery tracking events
- **Plans & Usage** (`workspace_plans`, `usage_counters_daily`) - Billing and quotas

## 2. Endpoints

### 2.1 Authentication & Authorization

#### Create API Key
```
POST /v1/api-keys
```
**Description**: Create a new API key with specific scopes
**Auth**: User session (owner role required)
**Request Body**:
```json
{
  "name": "Production API Key",
  "scopes": ["send", "templates:read", "templates:write"],
  "expires_at": "2025-12-31T23:59:59Z"
}
```
**Success Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "rq_live_abc123...",
  "key_prefix": "rq_live_abc1",
  "name": "Production API Key",
  "scopes": ["send", "templates:read", "templates:write"],
  "created_at": "2025-10-26T10:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z"
}
```
**Error Responses**:
- `401 Unauthorized` - Missing or invalid session
- `403 Forbidden` - Insufficient permissions (not owner)
- `400 Bad Request` - Invalid scopes or expiration date

#### List API Keys
```
GET /v1/api-keys
```
**Description**: List all API keys for the workspace (without secrets)
**Auth**: User session (owner role required)
**Query Parameters**:
- `include_revoked` (boolean, default: false)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "key_prefix": "rq_live_abc1",
      "name": "Production API Key",
      "scopes": ["send", "templates:read"],
      "created_at": "2025-10-26T10:00:00Z",
      "last_used_at": "2025-10-26T12:30:00Z",
      "expires_at": null,
      "revoked_at": null
    }
  ]
}
```

#### Revoke API Key
```
DELETE /v1/api-keys/{keyId}
```
**Description**: Revoke an API key
**Auth**: User session (owner role required)
**Success Response** (204): No content
**Error Responses**:
- `404 Not Found` - Key doesn't exist
- `403 Forbidden` - Insufficient permissions

### 2.2 Workspaces

#### Get Current Workspace
```
GET /v1/workspace
```
**Description**: Get current workspace details including user role
**Auth**: API Key or User session (member role required)
**Success Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "role": "owner",
  "created_at": "2025-01-15T10:00:00Z",
  "plan": {
    "type": "pro",
    "limits": {
      "renders_per_month": 100000,
      "sends_per_month": 50000,
      "ai_generations_per_month": 1000
    }
  }
}
```

#### Update Workspace
```
PATCH /v1/workspace
```
**Description**: Update workspace settings (name, slug)
**Auth**: User session (owner role required)
**Request Body**:
```json
{
  "name": "New Workspace Name",
  "slug": "new-workspace-slug"
}
```
**Success Response** (200): Updated workspace object
**Error Responses**:
- `409 Conflict` - Slug already exists

#### Delete Workspace
```
DELETE /v1/workspace
```
**Description**: Permanently delete workspace and all associated resources
**Auth**: User session (owner role required)
**Success Response** (204): No content
**Error Responses**:
- `403 Forbidden` - User is not an owner

#### List Workspace Members
```
GET /v1/workspace/members
```
**Description**: List all members of the workspace
**Auth**: User session (member role required)
**Success Response** (200):
```json
{
  "data": [
    {
      "user_id": "user_123",
      "email": "owner@acme.com",
      "role": "owner",
      "invited_at": "2025-01-15T10:00:00Z",
      "accepted_at": "2025-01-15T10:05:00Z"
    }
  ]
}
```

#### Invite Member
```
POST /v1/workspace/invitations
```
**Description**: Invite a new member to workspace
**Auth**: User session (owner role required)
**Request Body**:
```json
{
  "email": "newmember@acme.com",
  "role": "member"
}
```
**Success Response** (201):
```json
{
  "id": "inv_123",
  "invitee_email": "newmember@acme.com",
  "role": "member",
  "token": "inv_token_abc...",
  "expires_at": "2025-11-02T10:00:00Z"
}
```

#### Accept Invitation
```
POST /v1/workspace/invitations/{token}/accept
```
**Description**: Accept workspace invitation
**Auth**: User session
**Success Response** (200): Workspace membership object

#### Cancel Invitation
```
DELETE /v1/workspace/invitations/{invitationId}
```
**Description**: Cancel pending invitation
**Auth**: User session (owner role required)
**Success Response** (204): No content

### 2.3 Templates

> **📝 Template Storage Architecture**
>
> **Primary Storage Format: Document (JSON)**
>
> Templates are created and edited using a visual builder that works with a structured JSON format called `Document`. This document is the **source of truth** stored in the database.
>
> **Rendering Engine: React Email**
>
> Document structure is converted to React Email components server-side, which then render to HTML. This approach provides:
> - Type-safe component rendering
> - Modern React-based email development
> - Excellent email client compatibility
> - No intermediate step - direct document → React Email → HTML
>
> **Document Structure** (Stored in DB):
> - Wrapper object containing version, root block, and metadata
> - **Document Schema**: `{ version, root: BlockIR, metadata? }`
>   - `version`: Schema version (default: "1.0")
>   - `root`: Root block of the template (BlockIR)
>   - `metadata`: Optional email metadata (subject, preheader, sender info, etc.)
>
> **Block Structure** (BlockIR):
> - Hierarchical JSON tree representing visual email components
> - Each block is an object with `id`, `type`, `props`, and optionally `name`, `children`, `slots`
> - **Block Schema**: `{ id, type, name?, props, children?, slots? }`
>   - `id`: Unique identifier (UUID)
>   - `type`: Block type name (container, section, heading, button, etc.)
>   - `name`: Optional display name for the block
>   - `props`: Block-specific properties (styling, content, etc.)
>   - `children`: Nested child blocks (for container elements)
>   - `slots`: Named slots for advanced layouts (e.g., columns with left/right slots)
>
> **Available Block Types**:
> - **Layout**: `container`, `section`, `column`, `columns`, `row`
> - **Content**: `heading`, `paragraph`, `text`, `button`, `divider`, `spacer`
> - **Media**: `image`, `video`
> - **Advanced**: `social-links`, `unsubscribe`, `custom`
>
> **Example Document Structure**:
> ```json
> {
>   "version": "1.0",
>   "root": {
>     "id": "550e8400-e29b-41d4-a716-446655440000",
>     "type": "container",
>     "props": {
>       "width": "600px",
>       "backgroundColor": "#ffffff",
>       "fontFamily": "Inter, sans-serif"
>     },
>     "children": [
>       {
>         "id": "550e8400-e29b-41d4-a716-446655440001",
>         "type": "section",
>         "props": { "padding": "40px 20px", "backgroundColor": "#f9fafb" },
>         "children": [
>           {
>             "id": "550e8400-e29b-41d4-a716-446655440002",
>             "type": "heading",
>             "props": {
>               "level": 1,
>               "content": "Welcome {{user_name}}!",
>               "fontSize": "32px",
>               "color": "#007AFF",
>               "align": "center"
>             }
>           },
>           {
>             "id": "550e8400-e29b-41d4-a716-446655440003",
>             "type": "paragraph",
>             "props": {
>               "content": "We're excited to have you on board.",
>               "fontSize": "16px",
>               "color": "#374151",
>               "lineHeight": "24px"
>             }
>           },
>           {
>             "id": "550e8400-e29b-41d4-a716-446655440004",
>             "type": "button",
>             "props": {
>               "text": "Complete your profile",
>               "href": "{{profile_url}}",
>               "backgroundColor": "#007AFF",
>               "textColor": "#ffffff",
>               "borderRadius": "8px",
>               "padding": "12px 24px"
>             }
>           }
>         ]
>       }
>     ]
>   },
>   "metadata": {
>     "title": "Welcome Email",
>     "subject": "Welcome to Acme, {{user_name}}!",
>     "preheader": "Complete your profile to unlock all features",
>     "senderName": "Acme Corp",
>     "senderEmail": "noreply@acme.com"
>   }
> }
> ```
>
> **Generation Flow**:
> 1. **Edit**: User creates/edits template in visual builder → `document` saved to DB
> 2. **Preview**: Document → React Email components → HTML → Preview
> 3. **Publish**: Document → React Email components → HTML → Snapshot (immutable)
> 4. **Send**: Published snapshot HTML (cached) → Per-recipient variable interpolation → Email sent
>
> **What's Stored**:
> - **Draft templates**: `document` (primary), optionally cached HTML for preview
> - **Published snapshots**: `document` + compiled `html` + `plaintext`
> - **Reasoning**: Document for editing, HTML for sending (React Email renders on-demand)
>
> **API Flexibility**:
> - Dashboard/Builder: Works with `document` endpoints
> - API users: Can submit raw HTML directly for simple use cases
> - Document format recommended for full feature support

#### AI Generate Template
```
POST /v1/templates/generate
```
**Description**: Generate email template using AI (returns document structure)
**Auth**: API Key (`templates:write`) or User session (member)
**Request Body**:
```json
{
  "prompt": "Create a welcome email for new users with a CTA to complete their profile",
  "brand_kit": {
    "primary_color": "#007AFF",
    "logo_url": "https://acme.com/logo.png",
    "company_name": "Acme Corp",
    "tone": "friendly"
  }
}
```

**Success Response** (200):
```json
{
  "document": {
    "version": "1.0",
    "root": {
      "id": "gen-001",
      "type": "container",
      "props": {
        "width": "600px",
        "backgroundColor": "#ffffff",
        "fontFamily": "Inter, sans-serif"
      },
      "children": [
        {
          "id": "gen-002",
          "type": "section",
          "props": { "padding": "40px 20px", "backgroundColor": "#f9fafb" },
          "children": [
            {
              "id": "gen-003",
              "type": "heading",
              "props": {
                "level": 1,
                "content": "Welcome {{user_name}}!",
                "fontSize": "32px",
                "color": "#007AFF",
                "align": "center"
              }
            },
            {
              "id": "gen-004",
              "type": "paragraph",
              "props": {
                "content": "We're excited to have you on board.",
                "fontSize": "16px",
                "color": "#374151"
              }
            },
            {
              "id": "gen-005",
              "type": "button",
              "props": {
                "text": "Complete your profile",
                "href": "{{profile_url}}",
                "backgroundColor": "#007AFF",
                "textColor": "#ffffff",
                "borderRadius": "8px"
              }
            }
          ]
        }
      ]
    },
    "metadata": {
      "subject": "Welcome to Acme, {{user_name}}!",
      "preheader": "Complete your profile to unlock all features"
    }
  },
  "variables_schema": {
    "type": "object",
    "properties": {
      "user_name": { "type": "string" },
      "profile_url": { "type": "string", "format": "uri" }
    },
    "required": ["user_name", "profile_url"]
  },
  "subject_lines": [
    "Welcome to Acme, {{user_name}}!",
    "Get started with Acme"
  ],
  "notes": ["Uses primary CTA color", "Mobile-optimized layout"],
  "safety_flags": {
    "contrast_issues": [],
    "missing_alt_texts": 0,
    "http_links": 0,
    "estimated_size_bytes": 45230
  }
}
```

> **AI Generation Flow**:
> - AI generates document structure directly based on prompt and brand kit
> - Variables extracted from content ({{placeholders}}) and included in schema
> - Safety flags estimated from block props (colors, content, etc.)
> - HTML generated on-demand via React Email for preview (not stored at this stage)

**Error Responses**:
- `400 Bad Request` - Invalid prompt or brand kit
- `402 Payment Required` - AI generation quota exceeded
- `429 Too Many Requests` - Rate limit exceeded

#### Create Template
```
POST /v1/templates
```
**Description**: Create a new template draft (document is primary storage)
**Auth**: API Key (`templates:write`) or User session (member)

**Request Body (Primary: Document format)**:
```json
{
  "stable_id": "welcome-email",
  "name": "Welcome Email",
  "document": {
    "version": "1.0",
    "root": {
      "id": "root-001",
      "type": "container",
      "props": { "width": "600px", "backgroundColor": "#ffffff" },
      "children": [
        {
          "id": "section-001",
          "type": "section",
          "props": { "padding": "40px 20px" },
          "children": [
            {
              "id": "heading-001",
              "type": "heading",
              "props": {
                "level": 1,
                "content": "Welcome {{user_name}}!",
                "fontSize": "32px",
                "color": "#007AFF"
              }
            },
            {
              "id": "button-001",
              "type": "button",
              "props": {
                "text": "Get started",
                "href": "{{cta_url}}",
                "backgroundColor": "#007AFF"
              }
            }
          ]
        }
      ]
    },
    "metadata": {
      "subject": "Welcome {{user_name}}!",
      "preheader": "Get started today"
    }
  },
  "variables_schema": {
    "type": "object",
    "properties": {
      "user_name": { "type": "string" },
      "cta_url": { "type": "string", "format": "uri" }
    },
    "required": ["user_name", "cta_url"]
  }
}
```

**Request Body (Alternative: Raw HTML for API users)**:
```json
{
  "stable_id": "welcome-email",
  "name": "Welcome Email",
  "html": "<html>...</html>",
  "variables_schema": { ... },
  "subject_lines": ["Welcome!"],
  "preheader": "Get started today"
}
```

> **Note**:
> - **Document format** (recommended): Used by visual editor, stored directly in database
> - **HTML format**: Accepted for simple API use cases (no editor features like visual editing)
> - Document is rendered to HTML via React Email on-demand
> - variables_schema is auto-extracted from {{placeholders}} if not provided

**Success Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "workspace_id": "ws_123",
  "stable_id": "welcome-email",
  "name": "Welcome Email",
  "current_snapshot_id": null,
  "has_document": true,
  "has_html": true,
  "created_at": "2025-10-26T10:00:00Z"
}
```

> **Response Note**: `has_document` and `has_html` indicate which formats are stored. Use GET endpoint to retrieve actual content.

**Error Responses**:
- `400 Bad Request` - Invalid document structure or schema
- `409 Conflict` - stable_id already exists in workspace

#### List Templates
```
GET /v1/templates
```
**Description**: List all templates in workspace
**Auth**: API Key (`templates:read`) or User session (member)
**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `search` (string) - Search by name or stable_id

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "tmpl_123",
      "stable_id": "welcome-email",
      "name": "Welcome Email",
      "current_snapshot_id": "snap_456",
      "created_at": "2025-10-26T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### Get Template
```
GET /v1/templates/{stableId}
```
**Description**: Get template details with current snapshot
**Auth**: API Key (`templates:read`) or User session (member)
**Query Parameters**:
- `include_document` (boolean, default: true) - Include document structure in response
- `include_html` (boolean, default: false) - Include rendered HTML in response

**Success Response** (200):
```json
{
  "id": "tmpl_123",
  "stable_id": "welcome-email",
  "name": "Welcome Email",
  "draft": {
    "document": {
      "version": "1.0",
      "root": {
        "id": "root-001",
        "type": "container",
        "props": { "width": "600px" },
        "children": [ ... ]
      },
      "metadata": {
        "subject": "Welcome!",
        "preheader": "Get started today"
      }
    },
    "variables_schema": { ... },
    "updated_at": "2025-10-26T09:00:00Z"
  },
  "current_snapshot": {
    "id": "snap_456",
    "version": 3,
    "published_at": "2025-10-25T15:00:00Z",
    "html": "<html>...</html>",
    "plaintext": "Welcome...",
    "variables_schema": { ... },
    "size_bytes": 45230,
    "safety_flags": { ... }
  },
  "created_at": "2025-10-20T10:00:00Z"
}
```

> **Note**:
> - `draft` contains unpublished changes (includes document if `include_document=true`)
> - `current_snapshot` contains published version (HTML rendered from document via React Email)
> - If `include_document=false`, `document` is omitted from draft
> - If `include_html=true`, HTML is generated on-demand from document

**Error Responses**:
- `404 Not Found` - Template doesn't exist

#### Update Template (Draft)
```
PATCH /v1/templates/{stableId}
```
**Description**: Update template draft (doesn't affect published snapshot)
**Auth**: API Key (`templates:write`) or User session (member)

**Request Body (Update Document)**:
```json
{
  "name": "Updated Name",
  "document": {
    "version": "1.0",
    "root": {
      "id": "root-001",
      "type": "container",
      "props": { "width": "600px" },
      "children": [ ... ]
    },
    "metadata": {
      "subject": "New subject",
      "preheader": "New preheader"
    }
  },
  "variables_schema": { ... }
}
```

> **Note**:
> - All fields are optional in PATCH request
> - `document` is the source of truth - HTML is generated via React Email on-demand
> - Subject and preheader are part of document.metadata
> - Draft changes do not affect published snapshot until `POST /publish` is called

**Success Response** (200): Updated template object

#### Generate Preview from Draft
```
POST /v1/templates/{stableId}/preview
```
**Description**: Generate HTML preview from current draft (builder → React Email → HTML)
**Auth**: API Key (`templates:read`) or User session (member)
**Request Body**:
```json
{
  "variables": {
    "user_name": "John Doe",
    "cta_url": "https://example.com"
  },
  "device": "desktop"
}
```
**Query Parameters**:
- `device` (enum: desktop, mobile, default: desktop) - Preview device type

**Success Response** (200):
```json
{
  "html": "<html>...</html>",
  "plaintext": "Plain text version...",
  "size_bytes": 46230,
  "safety_flags": {
    "contrast_issues": [],
    "missing_alt_texts": 0,
    "http_links": 0
  },
  "warnings": []
}
```

> **Note**:
> - Preview uses current draft's document (not published snapshot)
> - Document rendered to HTML via React Email components
> - Variables interpolated for realistic preview
> - Safety checks performed on generated HTML
> - Cached for 5 minutes (invalidated on draft update)

**Error Responses**:
- `404 Not Found` - Template doesn't exist
- `400 Bad Request` - Document invalid or rendering failed

#### Publish Template Snapshot
```
POST /v1/templates/{stableId}/publish
```
**Description**: Publish immutable snapshot from current draft (document → React Email → HTML)
**Auth**: API Key (`templates:write`) or User session (member)
**Request Body**:
```json
{
  "notes": ["Fixed contrast issues", "Updated CTA colors"]
}
```

> **Note**:
> - Publishes current draft's `document` as immutable snapshot
> - HTML generated automatically via React Email rendering
> - All fields (variables_schema, metadata) taken from draft
> - Only `notes` can be added for this publish operation
> - Document structure and compiled HTML stored in snapshot

**Success Response** (201):
```json
{
  "snapshot_id": "snap_789",
  "template_id": "tmpl_123",
  "version": 4,
  "published_at": "2025-10-26T10:00:00Z",
  "document": {
    "version": "1.0",
    "root": {
      "id": "root-001",
      "type": "container",
      "props": { ... },
      "children": [ ... ]
    },
    "metadata": { ... }
  },
  "html": "<html>...</html>",
  "plaintext": "Plain text version...",
  "size_bytes": 46120,
  "safety_flags": {
    "contrast_issues": [],
    "missing_alt_texts": 0,
    "http_links": 0
  },
  "notes": ["Fixed contrast issues", "Updated CTA colors"]
}
```

> **Snapshot Storage**:
> - Two formats stored: `document` (source), `html` (final)
> - Allows future rollback to previous version and continue editing from that state
> - HTML used for actual sending (cached in Redis)
> - Document allows viewing/copying old design to new template

**Error Responses**:
- `400 Bad Request` - Validation failed (guardrails)
- `409 Conflict` - HTML size exceeds 150KB
- `409 Conflict` - No draft changes to publish

#### Validate Template
```
POST /v1/templates/{stableId}/validate
```
**Description**: Pre-check template with variables without sending
**Auth**: API Key (`templates:read`) or User session (member)
**Request Body**:
```json
{
  "variables": {
    "user_name": "John",
    "profile_url": "https://app.acme.com/profile"
  },
  "validation_mode": "strict"
}
```
**Success Response** (200):
```json
{
  "ok": true,
  "errors": [],
  "warnings": [
    {
      "code": "PREHEADER_LENGTH",
      "message": "Preheader is longer than 100 characters",
      "path": "preheader"
    }
  ],
  "rendered_size_bytes": 46230
}
```
**Error Responses** (if validation fails, still returns 200):
```json
{
  "ok": false,
  "errors": [
    {
      "code": "MISSING_VARIABLE",
      "message": "Required variable 'user_name' is missing",
      "path": "variables.user_name"
    },
    {
      "code": "CONTRAST_FAIL",
      "message": "Text contrast ratio 2.1:1 fails WCAG AA (min 4.5:1)",
      "path": "body.section[0].text"
    }
  ],
  "warnings": []
}
```

#### List Template Snapshots
```
GET /v1/templates/{stableId}/snapshots
```
**Description**: List all published snapshots for a template
**Auth**: API Key (`templates:read`) or User session (member)
**Query Parameters**:
- `page` (integer)
- `limit` (integer)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "snap_789",
      "version": 4,
      "published_at": "2025-10-26T10:00:00Z",
      "size_bytes": 46120,
      "notes": ["Fixed contrast issues"]
    }
  ],
  "pagination": { ... }
}
```

#### Delete Template
```
DELETE /v1/templates/{stableId}
```
**Description**: Delete template and all its snapshots
**Auth**: API Key (`templates:write`) or User session (owner)
**Success Response** (204): No content

### 2.4 Brand Kit

#### Get Brand Kit
```
GET /v1/workspace/brandkit
```
**Description**: Get workspace brand kit configuration
**Auth**: API Key or User session (member)
**Success Response** (200):
```json
{
  "data": {
    "primary_color": "#007AFF",
    "secondary_color": "#5856D6",
    "logo_url": "https://cdn.acme.com/logo.png",
    "company_name": "Acme Corp",
    "company_address": "123 Main St, SF, CA 94105",
    "company_email": "hello@acme.com",
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "tone": "friendly",
    "footer_links": [
      { "label": "Privacy Policy", "url": "https://acme.com/privacy" },
      { "label": "Terms", "url": "https://acme.com/terms" }
    ]
  },
  "updated_at": "2025-10-20T10:00:00Z"
}
```

#### Update Brand Kit
```
PUT /v1/workspace/brandkit
```
**Description**: Update brand kit configuration
**Auth**: User session (member)
**Request Body**: Same structure as GET response
**Success Response** (200): Updated brand kit object

### 2.5 Transports

#### Get Transport Configuration
```
GET /v1/workspace/transport
```
**Description**: Get email transport configuration (without secrets)
**Auth**: User session (owner)
**Success Response** (200):
```json
{
  "id": "trans_123",
  "type": "smtp",
  "state": "active",
  "from_domain": "acme.com",
  "from_email": "noreply@acme.com",
  "smtp_host": "smtp.sendgrid.net",
  "smtp_port": 587,
  "smtp_secure": true,
  "smtp_user": "apikey",
  "updated_at": "2025-10-20T10:00:00Z"
}
```

#### Create/Update Transport
```
PUT /v1/workspace/transport
```
**Description**: Configure email transport (Resend or SMTP)
**Auth**: User session (owner)
**Request Body (Resend)**:
```json
{
  "type": "resend",
  "from_domain": "acme.com",
  "from_email": "noreply@acme.com",
  "secret": "re_123456..."
}
```
**Request Body (SMTP)**:
```json
{
  "type": "smtp",
  "from_domain": "acme.com",
  "from_email": "noreply@acme.com",
  "smtp_host": "smtp.sendgrid.net",
  "smtp_port": 587,
  "smtp_secure": true,
  "smtp_user": "apikey",
  "secret": "SG.abc123..."
}
```
**Success Response** (200):
```json
{
  "id": "trans_123",
  "type": "smtp",
  "state": "unverified",
  "from_domain": "acme.com",
  "from_email": "noreply@acme.com"
}
```
**Error Responses**:
- `400 Bad Request` - Invalid configuration
- `503 Service Unavailable` - Cannot connect to SMTP server

#### Verify Transport
```
POST /v1/workspace/transport/verify
```
**Description**: Send test email to verify transport configuration
**Auth**: User session (owner)
**Request Body**:
```json
{
  "test_email": "owner@acme.com"
}
```
**Success Response** (200):
```json
{
  "verified": true,
  "state": "active",
  "message": "Test email sent successfully"
}
```

#### Check DNS Records
```
GET /v1/workspace/transport/dns
```
**Description**: Check SPF/DKIM DNS records for domain
**Auth**: User session (owner)
**Success Response** (200):
```json
{
  "domain": "acme.com",
  "records": {
    "spf": {
      "configured": true,
      "value": "v=spf1 include:_spf.resend.com ~all",
      "valid": true
    },
    "dkim": {
      "configured": true,
      "valid": true
    }
  }
}
```

### 2.6 Email Sending (Core)

#### Send Email
```
POST /v1/send
```
**Description**: Validate, render, and send emails to recipients
**Auth**: API Key (`send`)
**Headers**:
- `Idempotency-Key` (required): Unique key for idempotent requests
- `Authorization`: Bearer {api_key}

**Request Body**:
```json
{
  "template": "welcome-email",
  "transport": "smtp",
  "subject": "Welcome to Acme, {{user_name}}!",
  "preheader": "Get started today",
  "to": [
    {
      "email": "user1@example.com",
      "variables": {
        "user_name": "John",
        "profile_url": "https://app.acme.com/profile/1"
      }
    },
    {
      "email": "user2@example.com",
      "variables": {
        "user_name": "Jane",
        "profile_url": "https://app.acme.com/profile/2"
      }
    }
  ]
}
```

**Success Response** (200):
```json
{
  "ok": true,
  "job_id": "job_abc123",
  "used_template_snapshot_id": "snap_456",
  "sent": 2,
  "failed": 0,
  "warnings": []
}
```

**Partial Success Response** (200):
```json
{
  "ok": true,
  "job_id": "job_abc123",
  "used_template_snapshot_id": "snap_456",
  "sent": 1,
  "failed": 1,
  "failed_recipients": [
    {
      "email": "user2@example.com",
      "reason": "suppressed",
      "error_code": "HARD_BOUNCE",
      "message": "Email address is on suppression list due to previous hard bounce"
    }
  ],
  "warnings": [
    {
      "code": "PREHEADER_TRUNCATED",
      "message": "Preheader exceeds 100 characters and may be truncated"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request` - Validation failed (no emails sent)
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Template validation failed",
    "details": [
      {
        "recipient": "user1@example.com",
        "errors": [
          {
            "code": "MISSING_VARIABLE",
            "message": "Required variable 'profile_url' is missing",
            "path": "variables.profile_url"
          }
        ]
      }
    ]
  },
  "trace_id": "tr_xyz789"
}
```
- `409 Conflict` - Template has no published snapshot or idempotency key conflict
```json
{
  "ok": false,
  "error": {
    "code": "NO_PUBLISHED_SNAPSHOT",
    "message": "Template 'welcome-email' has no published snapshot. Publish a snapshot before sending.",
    "action": "POST /v1/templates/welcome-email/publish"
  },
  "trace_id": "tr_xyz789"
}
```
- `409 Conflict` - Idempotency key with different body
```json
{
  "ok": false,
  "error": {
    "code": "IDEMPOTENCY_CONFLICT",
    "message": "Request body differs from original request with same Idempotency-Key",
    "original_request_hash": "sha256:abc...",
    "current_request_hash": "sha256:def..."
  },
  "trace_id": "tr_xyz789"
}
```
- `429 Too Many Requests` - Rate limit exceeded
```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Sending rate limit exceeded for workspace",
    "limit": 100,
    "window": "1m",
    "retry_after": 42
  },
  "trace_id": "tr_xyz789"
}
```
- `402 Payment Required` - Usage quota exceeded
```json
{
  "ok": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly sending quota exceeded",
    "used": 50000,
    "limit": 50000,
    "resets_at": "2025-11-01T00:00:00Z"
  },
  "trace_id": "tr_xyz789"
}
```
- `503 Service Unavailable` - Transport unavailable (transient)
- `502 Bad Gateway` - Transport error (transient)

#### Get Send Job Status
```
GET /v1/send/{jobId}
```
**Description**: Get status of a send job
**Auth**: API Key (`send`) or User session (member)
**Success Response** (200):
```json
{
  "id": "job_abc123",
  "workspace_id": "ws_123",
  "template_snapshot_id": "snap_456",
  "transport": "smtp",
  "status": "completed",
  "created_at": "2025-10-26T10:00:00Z",
  "recipients": {
    "total": 2,
    "pending": 0,
    "sent": 2,
    "delivered": 1,
    "bounced": 0,
    "failed": 0,
    "suppressed": 0
  }
}
```

#### List Send Jobs
```
GET /v1/send
```
**Description**: List send jobs for workspace
**Auth**: API Key (`send`) or User session (member)
**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `status` (enum: pending, processing, completed, failed)
- `from_date` (ISO 8601)
- `to_date` (ISO 8601)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "job_abc123",
      "status": "completed",
      "transport": "smtp",
      "created_at": "2025-10-26T10:00:00Z",
      "recipients": {
        "total": 100,
        "sent": 98,
        "failed": 2
      }
    }
  ],
  "pagination": { ... }
}
```

### 2.7 Subscribers (Newsletter)

#### Create Subscriber (Public - Hosted Form)
```
POST /v1/public/subscribers
```
**Description**: Subscribe email address (double opt-in flow)
**Auth**: None (rate-limited by IP)
**Request Body**:
```json
{
  "email": "subscriber@example.com",
  "attributes": {
    "first_name": "John",
    "source": "website"
  },
  "tags": ["newsletter", "blog"]
}
```
**Success Response** (201):
```json
{
  "id": "sub_123",
  "email": "subscriber@example.com",
  "status": "pending",
  "message": "Confirmation email sent. Please check your inbox."
}
```
**Error Responses**:
- `400 Bad Request` - Invalid email
- `409 Conflict` - Email already subscribed
- `429 Too Many Requests` - Rate limit exceeded

#### Confirm Subscription
```
POST /v1/public/subscribers/confirm/{token}
```
**Description**: Confirm email subscription via token from confirmation email
**Auth**: None
**Success Response** (200):
```json
{
  "id": "sub_123",
  "email": "subscriber@example.com",
  "status": "active",
  "confirmed_at": "2025-10-26T10:05:00Z"
}
```

#### List Subscribers
```
GET /v1/subscribers
```
**Description**: List subscribers with filtering
**Auth**: API Key (`subscribers:read`) or User session (member)
**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `status` (enum: pending, active, unsubscribed, bounced, complaint)
- `tags` (comma-separated)
- `search` (string) - Search by email

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "sub_123",
      "email": "subscriber@example.com",
      "status": "active",
      "attributes": {
        "first_name": "John"
      },
      "tags": ["newsletter", "blog"],
      "confirmed_at": "2025-10-26T10:05:00Z",
      "created_at": "2025-10-26T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Get Subscriber
```
GET /v1/subscribers/{subscriberId}
```
**Description**: Get subscriber details
**Auth**: API Key (`subscribers:read`) or User session (member)
**Success Response** (200): Subscriber object with full details

#### Update Subscriber
```
PATCH /v1/subscribers/{subscriberId}
```
**Description**: Update subscriber attributes or tags
**Auth**: API Key (`subscribers:write`) or User session (member)
**Request Body**:
```json
{
  "attributes": {
    "first_name": "Johnny",
    "preferences": {
      "frequency": "weekly"
    }
  },
  "tags": ["newsletter", "premium"]
}
```
**Success Response** (200): Updated subscriber object

#### Unsubscribe (Public)
```
POST /v1/public/subscribers/unsubscribe/{token}
```
**Description**: Unsubscribe via token from List-Unsubscribe header
**Auth**: None
**Success Response** (200):
```json
{
  "email": "subscriber@example.com",
  "status": "unsubscribed",
  "message": "You have been unsubscribed successfully."
}
```

#### Delete Subscriber
```
DELETE /v1/subscribers/{subscriberId}
```
**Description**: Permanently delete subscriber (GDPR)
**Auth**: API Key (`subscribers:write`) or User session (member)
**Success Response** (204): No content

### 2.8 Suppression List

#### List Suppression Entries
```
GET /v1/suppression
```
**Description**: List suppressed email addresses
**Auth**: API Key or User session (member)
**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `reason` (enum: unsubscribed, hard_bounce, complaint, manual)
- `search` (string)

**Success Response** (200):
```json
{
  "data": [
    {
      "email": "bounced@example.com",
      "reason": "hard_bounce",
      "source_event_id": "evt_123",
      "created_at": "2025-10-25T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Add to Suppression List
```
POST /v1/suppression
```
**Description**: Manually add email to suppression list
**Auth**: API Key or User session (member)
**Request Body**:
```json
{
  "email": "spam@example.com",
  "reason": "manual"
}
```
**Success Response** (201): Suppression entry object

#### Remove from Suppression List
```
DELETE /v1/suppression/{email}
```
**Description**: Remove email from suppression list
**Auth**: API Key or User session (owner)
**Success Response** (204): No content

### 2.9 Events & Tracking

#### List Events
```
GET /v1/events
```
**Description**: List email events (sent, delivered, bounced, opened, clicked)
**Auth**: API Key or User session (member)
**Query Parameters**:
- `page` (integer)
- `limit` (integer)
- `type` (enum: sent, delivered, bounced, opened, clicked)
- `recipient_email` (string)
- `job_id` (string)
- `from_date` (ISO 8601)
- `to_date` (ISO 8601)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "evt_123",
      "type": "delivered",
      "recipient_email": "user@example.com",
      "job_id": "job_abc123",
      "template_snapshot_id": "snap_456",
      "transport": "smtp",
      "external_id": "msg_xyz789",
      "occurred_at": "2025-10-26T10:02:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### Webhook Endpoint (Inbound)
```
POST /v1/webhooks/events
```
**Description**: Receive webhook events from transport providers (Resend, SMTP)
**Auth**: HMAC signature verification
**Headers**:
- `X-Requil-Signature`: HMAC-SHA256 signature
- `X-Requil-Timestamp`: Unix timestamp
- `X-Requil-Nonce`: Unique nonce

**Request Body**:
```json
{
  "type": "delivered",
  "recipient_email": "user@example.com",
  "job_id": "job_abc123",
  "template_snapshot_id": "snap_456",
  "transport": "smtp",
  "external_id": "msg_xyz789",
  "occurred_at": "2025-10-26T10:02:00Z",
  "metadata": {
    "message_id": "<abc@mail.acme.com>",
    "smtp_response": "250 2.0.0 OK"
  }
}
```
**Success Response** (200):
```json
{
  "received": true
}
```
**Error Responses**:
- `401 Unauthorized` - Invalid HMAC signature
- `400 Bad Request` - Replay attack detected (timestamp/nonce)

### 2.10 Usage & Billing

#### Get Usage
```
GET /v1/usage
```
**Description**: Get current usage and plan limits
**Auth**: API Key (`usage:read`) or User session (member)
**Query Parameters**:
- `period` (enum: current_month, last_30_days, custom)
- `from_date` (ISO 8601, for custom period)
- `to_date` (ISO 8601, for custom period)

**Success Response** (200):
```json
{
  "period": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-10-31T23:59:59Z"
  },
  "plan": {
    "type": "pro",
    "limits": {
      "renders_per_month": 100000,
      "sends_per_month": 50000,
      "ai_generations_per_month": 1000
    }
  },
  "usage": {
    "renders": 45230,
    "sends": 23450,
    "ai_generations": 67
  },
  "percentages": {
    "renders": 45.23,
    "sends": 46.9,
    "ai_generations": 6.7
  },
  "alerts": [
    {
      "type": "warning",
      "message": "You have used 45% of your monthly render quota"
    }
  ]
}
```

#### Get Usage History
```
GET /v1/usage/history
```
**Description**: Get daily usage breakdown
**Auth**: API Key (`usage:read`) or User session (member)
**Query Parameters**:
- `from_date` (ISO 8601)
- `to_date` (ISO 8601)
- `granularity` (enum: day, week, month)

**Success Response** (200):
```json
{
  "data": [
    {
      "day": "2025-10-26",
      "renders": 1234,
      "sends": 890,
      "ai_generations": 5
    }
  ]
}
```

## 3. Authentication & Authorization

### 3.1 Authentication Methods

#### API Keys (Primary)
- **Format**: `rq_live_` or `rq_test_` prefix + random string
- **Storage**: Hashed with Argon2id in database, only prefix stored in plaintext
- **Usage**: Sent via `Authorization: Bearer {api_key}` header
- **Scopes**: Granular permissions (send, templates:read, templates:write, etc.)

#### User Sessions (Dashboard)
- **Provider**: Supabase Auth
- **Methods**: Email/password, Google OAuth, GitHub OAuth
- **Session**: JWT token stored in httpOnly cookie
- **Roles**: owner (full access), member (limited access per RLS)

### 3.2 Authorization (RLS & Scopes)

#### Row-Level Security (RLS)
- All tables filtered by `workspace_id` via Supabase RLS policies
- User context set via `app.workspace_id` session variable
- Function `is_member(workspace_id, min_role)` checks access

#### API Key Scopes
- `send` - Send emails via /v1/send
- `templates:read` - Read templates and snapshots
- `templates:write` - Create/update/publish templates
- `subscribers:read` - Read subscriber data
- `subscribers:write` - Manage subscribers
- `keys:manage` - Manage API keys (owner only)
- `transports:manage` - Configure transports (owner only)
- `usage:read` - Read usage metrics
- `webhooks:manage` - Configure webhooks (owner only)

#### Role-Based Access
- **Owner**: Full workspace access, can manage API keys, transports, billing, invitations
- **Member**: Can manage templates, send emails, view usage (read-only on workspace settings)

### 3.3 Rate Limiting

#### Per-Workspace Limits (Token Bucket)
- **Starter Plan**: 10 requests/second, 1000 requests/minute
- **Pro Plan**: 50 requests/second, 5000 requests/minute
- Implementation: Upstash Redis token bucket
- Response: `429 Too Many Requests` with `Retry-After` header

#### Per-Transport Limits
- Separate rate limits for Resend and SMTP transports
- Configurable based on provider limits
- Prevents exceeding external service quotas

#### Public Endpoint Limits
- `/v1/public/subscribers`: 5 requests/minute per IP
- `/v1/public/subscribers/confirm`: 10 requests/hour per token
- `/v1/public/subscribers/unsubscribe`: 10 requests/hour per token

### 3.4 Idempotency

#### Idempotency-Key Header
- Required for `POST /v1/send`
- Format: Any string (UUID recommended), max 255 characters
- TTL: 24 hours (configurable)

#### Implementation
- Lock: `lock:send:{idempotency_key}` in Redis (prevents concurrent execution)
- Hash: SHA-256 of request body stored with key
- Result: `result:send:{idempotency_key}` stores response for replay
- Different body with same key → `409 Conflict`
- Expired key (>24h) → Treated as new request

#### Partial Success Handling
- Per-recipient status tracked in `send_recipients` table
- Retry with same key only retries failed recipients
- Response includes `sent`, `failed`, and `failed_recipients[]`

## 4. Validation & Business Logic

### 4.1 Template Validation

#### Document Schema Validation
- Valid Document/BlockIR structure checked before saving
- Document rendered to HTML via React Email and validated
- Maximum HTML size: 150KB (hard limit)

#### Block Structure Validation (BlockIR)
- **Schema Validation**: Document validated against Zod schema
  - **Document required fields**: `version`, `root` (BlockIR)
  - **Document optional fields**: `metadata` (subject, preheader, sender info)
  - **BlockIR required fields**: `id` (UUID), `type`, `props`
  - **BlockIR optional fields**: `name`, `children`, `slots`
- **Block Type validation**: Each `type` must be a known block type
  - Layout blocks: `container`, `section`, `column`, `columns`, `row`
  - Content blocks: `heading`, `paragraph`, `text`, `button`, `divider`, `spacer`
  - Media blocks: `image`, `video`
  - Advanced blocks: `social-links`, `unsubscribe`, `custom`
- **Rendering to HTML**: Document rendered via React Email components
  - Each block `type` maps to React Email component
  - Props transformed to component props
  - Recursive processing of `children` and `slots` arrays
- **Validation After Rendering**: Generated HTML validated for email compatibility
- **Error Handling**:
  - Invalid document structure → `400 INVALID_DOCUMENT_STRUCTURE`
  - Unknown block type → `400 UNKNOWN_BLOCK_TYPE`
  - Rendering errors → `400 RENDER_ERROR` with path to problematic block
  - HTML validation errors → `400 HTML_VALIDATION_ERROR`

> **Implementation Note**:
> - Document → HTML rendering happens in `@requil/email-engine` package
> - Uses React Email components for cross-client compatibility
> - Extensible system allows adding new block types (post-MVP)
> - Document is primary storage, HTML generated on-demand via React Email

#### Variables Schema Validation (AJV)
- JSON Schema validation for variables
- Modes:
  - **strict**: Rejects missing required fields and unknown properties
  - **permissive**: Allows unknown properties, logs warnings for missing fields
- Default values applied from schema before rendering
- Breaking changes (removed required fields) require new snapshot

#### Quality Guardrails (Safety Flags)
1. **Contrast (WCAG AA)**
   - Text: minimum 4.5:1 ratio
   - Large text (18pt+): minimum 3:1 ratio
   - CTA buttons: minimum 4.5:1 ratio
   - Auto-fix available (lightens/darkens within brand kit tolerance)

2. **Alt Texts**
   - 100% of images must have alt attribute
   - Empty alt allowed for decorative images only
   - Hard error if missing

3. **HTTPS Links**
   - All external links must use HTTPS
   - Auto-fix converts HTTP to HTTPS if available
   - rel="noopener" added to all external links

4. **Size Limit**
   - HTML output < 150KB (hard limit)
   - Warning at 100KB (66%)
   - Error response identifies largest sections

5. **Content Length**
   - Subject line: recommended < 60 characters (warning)
   - Preheader: recommended < 100 characters (warning)
   - CTA text: recommended < 30 characters (warning)
   - Paragraph: recommended < 200 words (warning)

### 4.2 Send Validation & Logic

#### Pre-Send Validation
1. Check template has published snapshot (409 if not)
2. Validate all recipient emails (RFC 5322)
3. Check suppression list for each recipient
4. Validate variables against schema for each recipient
5. Check workspace usage quota (402 if exceeded)
6. Check rate limits (429 if exceeded)
7. Verify transport is active and configured

#### Per-Recipient Rendering
- Each recipient gets individually rendered email
- Variables interpolated via Liquid
- Plaintext auto-generated from HTML
- Tracking pixels/links inserted if enabled
- List-Unsubscribe header added with token

#### Suppression Logic
- Recipients on suppression list automatically skipped
- Reasons: hard_bounce, complaint, unsubscribed, manual
- Counted in `failed` with `suppressed` status
- Included in `failed_recipients[]` array

#### Retry Logic (QStash)
- Transient errors (5xx, network) → Retry up to 5 times
- Exponential backoff: 1s, 2s, 4s, 8s, 15s (max)
- Permanent errors (4xx, hard bounce) → No retry, move to DLQ
- Per-recipient tracking in `send_recipients.attempts`

#### Batch Fan-Out
- Campaigns > 500 recipients split into batches
- Each batch: separate QStash job
- Checkpoint tracking in Redis: `job:{job_id}:progress`
- Failure in one batch doesn't affect others

### 4.3 Subscriber Management Logic

#### Double Opt-In Flow
1. POST `/v1/public/subscribers` → Status: `pending`
2. Send confirmation email with signed token
3. Click link → POST `/v1/public/subscribers/confirm/{token}`
4. Status changed to `active`, `confirmed_at` timestamp set
5. Token expires after 72 hours

#### Status Transitions
- `pending` → `active` (via confirmation)
- `active` → `unsubscribed` (via unsubscribe link or API)
- `active` → `bounced` (via webhook after hard bounce)
- `active` → `complaint` (via webhook after spam complaint)
- Any status → `active` (via resubscribe, clears suppression)

#### Suppression Integration
- Unsubscribe → Add to suppression list (reason: unsubscribed)
- Hard bounce → Add to suppression + update subscriber status
- Complaint → Add to suppression + update subscriber status

### 4.4 Webhook Validation & Security

#### HMAC Verification
- Algorithm: HMAC-SHA256
- Secret: Workspace-specific webhook secret
- Signature: `HMAC(timestamp + nonce + body, secret)`
- Header: `X-Requil-Signature: sha256={signature}`

#### Replay Protection
- Timestamp must be within 5 minutes of current time
- Nonce stored in Redis with 10-minute TTL
- Duplicate nonce → 400 Replay Attack

#### Retry Policy (Outgoing Webhooks)
- QStash manages retries to customer endpoints
- Exponential backoff up to 5 attempts
- Failed webhooks logged for manual replay

### 4.5 Usage Tracking & Quotas

#### Real-Time Counting
- Renders: Incremented on each template render (including validation)
- Sends: Incremented on each successful recipient send
- AI Generations: Incremented on each AI generate call

#### Quota Enforcement
- Check before operation (optimistic locking)
- Hard stop at 100% usage → 402 Payment Required
- Alert at 80% usage → Email notification to workspace owner
- Reset: Monthly on workspace creation anniversary

#### Usage Counters (Redis + DB)
- Redis: Real-time counters with daily keys
- DB: Daily aggregation in `usage_counters_daily`
- Cron job: Flush Redis to DB daily, calculate totals

### 4.6 Cache Strategy

#### Template Cache (Redis)
- **Published Snapshot HTML** (for sending):
  - Key: `snapshot:{snapshot_id}:html`
  - Value: Pre-compiled HTML from published snapshot
  - TTL: 30 days (rarely changes)
  - Invalidation: Never (snapshots are immutable)
  - Used for: Actual email sending (per-recipient variable interpolation only)

- **Draft Preview** (document → React Email → HTML):
  - Key: `template:{template_id}:draft:preview:{variables_hash}`
  - Value: Rendered HTML with variables
  - TTL: 5 minutes (frequently updated during editing)
  - Invalidation: On draft update
  - Used for: Real-time preview in editor

> **Cache Flow**:
> - **Editing**: document (DB) → React Email render → [cache HTML preview]
> - **Publishing**: document → React Email render → store HTML in snapshot (DB)
> - **Sending**: snapshot HTML (cached) → interpolate variables → send

#### Brand Kit Cache (Redis)
- Key: `workspace:{workspace_id}:brandkit`
- Value: Brand kit JSON
- TTL: 1 hour
- Invalidation: On brand kit update

#### Variables Schema Cache (Redis)
- Key: `snapshot:{snapshot_id}:schema`
- Value: Compiled AJV validator
- TTL: 7 days
- Invalidation: On new snapshot publish

## 5. Error Handling

### 5.1 Error Response Format

All errors follow consistent structure:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [],
    "action": "Suggested action or API endpoint"
  },
  "trace_id": "tr_xyz789"
}
```

### 5.2 Error Categories & Codes

#### Validation Errors (400)
- `VALIDATION_ERROR` - Generic validation failure
- `MISSING_VARIABLE` - Required variable not provided
- `INVALID_VARIABLE_TYPE` - Variable type mismatch
- `CONTRAST_FAIL` - WCAG contrast requirement not met
- `MISSING_ALT_TEXT` - Image missing alt attribute
- `HTTP_LINK` - Non-HTTPS link detected
- `HTML_SIZE_EXCEEDED` - HTML exceeds 150KB limit
- `INVALID_EMAIL` - Malformed email address
- `INVALID_DOCUMENT_STRUCTURE` - Document structure validation failed (missing required fields)
- `UNKNOWN_BLOCK_TYPE` - Unknown block type in document
- `RENDER_ERROR` - Error rendering document to HTML via React Email
- `HTML_VALIDATION_ERROR` - Generated HTML failed email compatibility validation
- `MISSING_TEMPLATE_FORMAT` - Neither document nor html provided
- `MISSING_REQUIRED_PROP` - Block missing required prop

#### Authentication/Authorization Errors
- `401 UNAUTHORIZED` - Missing or invalid API key/session
- `403 FORBIDDEN` - Insufficient permissions (scope/role)
- `INVALID_API_KEY` - API key not found or revoked
- `INSUFFICIENT_SCOPE` - API key missing required scope
- `WORKSPACE_ACCESS_DENIED` - User not member of workspace

#### Resource Errors
- `404 NOT_FOUND` - Resource doesn't exist
- `409 CONFLICT` - Resource conflict
  - `NO_PUBLISHED_SNAPSHOT` - Template has no published snapshot
  - `STABLE_ID_EXISTS` - Template stable_id already exists
  - `IDEMPOTENCY_CONFLICT` - Request body differs from original
  - `EMAIL_EXISTS` - Subscriber email already exists

#### Quota/Rate Limit Errors
- `429 TOO_MANY_REQUESTS` - Rate limit exceeded
- `402 PAYMENT_REQUIRED` - Usage quota exceeded
- `RATE_LIMIT_EXCEEDED` - Too many requests in time window
- `QUOTA_EXCEEDED` - Monthly usage limit reached

#### Transport Errors
- `TRANSPORT_ERROR_TRANSIENT` - Temporary transport failure (5xx)
- `TRANSPORT_ERROR_PERMANENT` - Permanent transport failure (4xx)
- `TRANSPORT_NOT_CONFIGURED` - Workspace has no active transport
- `TRANSPORT_VERIFICATION_FAILED` - Transport credentials invalid
- `BOUNCE_HARD` - Hard bounce from email server
- `BOUNCE_SOFT` - Soft bounce from email server

#### Server Errors
- `500 INTERNAL_SERVER_ERROR` - Unexpected server error
- `502 BAD_GATEWAY` - Transport service unavailable
- `503 SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `504 GATEWAY_TIMEOUT` - Transport timeout

### 5.3 Validation Error Details

Validation errors include detailed field-level information:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Template validation failed for 2 recipients",
    "details": [
      {
        "recipient": "user1@example.com",
        "errors": [
          {
            "code": "MISSING_VARIABLE",
            "message": "Required variable 'profile_url' is missing",
            "path": "variables.profile_url",
            "expected": "string (uri format)"
          },
          {
            "code": "CONTRAST_FAIL",
            "message": "Text contrast ratio 2.1:1 fails WCAG AA (min 4.5:1)",
            "path": "body.section[0].text",
            "current_ratio": 2.1,
            "minimum_ratio": 4.5,
            "colors": {
              "foreground": "#999999",
              "background": "#FFFFFF"
            },
            "fix_available": true
          }
        ]
      }
    ]
  },
  "trace_id": "tr_xyz789"
}
```

**Document Validation Error Example**:
```json
{
  "ok": false,
  "error": {
    "code": "RENDER_ERROR",
    "message": "Failed to render document to HTML",
    "details": [
      {
        "code": "UNKNOWN_BLOCK_TYPE",
        "message": "Unknown block type 'custom-block'",
        "path": "root.children[0].children[1]",
        "received": {
          "id": "block-001",
          "type": "custom-block"
        },
        "allowed_types": ["container", "section", "column", "columns", "row", "heading", "paragraph", "text", "button", "divider", "spacer", "image", "video", "social-links", "unsubscribe", "custom"]
      },
      {
        "code": "MISSING_REQUIRED_PROP",
        "message": "Button block missing required prop 'href'",
        "path": "root.children[0].children[2].props",
        "block": {
          "id": "button-001",
          "type": "button"
        },
        "required": ["text", "href"],
        "received": ["text", "backgroundColor"]
      },
      {
        "code": "INVALID_DOCUMENT_STRUCTURE",
        "message": "Block missing required field 'id'",
        "path": "root.children[1]",
        "received": {
          "type": "section",
          "props": {}
        },
        "required_fields": ["id", "type", "props"]
      }
    ]
  },
  "trace_id": "tr_xyz789"
}
```

## 6. Webhooks (Outgoing)

### 6.1 Event Types

Requil sends webhooks for the following events:

- `email.sent` - Email accepted by transport
- `email.delivered` - Email delivered to recipient inbox
- `email.bounced` - Email bounced (hard or soft)
- `email.opened` - Email opened (tracking pixel loaded)
- `email.clicked` - Link clicked in email
- `subscriber.confirmed` - Subscriber confirmed double opt-in
- `subscriber.unsubscribed` - Subscriber unsubscribed

### 6.2 Webhook Payload Format

```json
{
  "id": "evt_abc123",
  "type": "email.delivered",
  "occurred_at": "2025-10-26T10:02:00Z",
  "data": {
    "recipient_email": "user@example.com",
    "job_id": "job_xyz789",
    "template_snapshot_id": "snap_456",
    "transport": "smtp",
    "external_id": "msg_external123"
  }
}
```

### 6.3 Webhook Security

#### Headers
- `X-Requil-Signature`: HMAC-SHA256 signature
- `X-Requil-Timestamp`: Unix timestamp (seconds)
- `X-Requil-Nonce`: Unique request nonce
- `Content-Type`: application/json

#### Verification Steps
1. Extract timestamp and verify it's within 5 minutes
2. Extract nonce and check it hasn't been used (Redis cache)
3. Compute HMAC: `HMAC-SHA256(timestamp + nonce + body, webhook_secret)`
4. Compare computed signature with header signature (constant-time)

### 6.4 Retry Policy

- Failed webhooks (non-2xx response) retried via QStash
- Retry schedule: 1s, 2s, 4s, 8s, 15s (5 attempts total)
- After 5 failures, webhook marked as failed in dashboard
- Manual replay available via dashboard

## 7. Pagination & Filtering

### 7.1 Pagination

All list endpoints use cursor-based pagination:

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "total_pages": 23,
    "has_next": true,
    "has_prev": false
  }
}
```

### 7.2 Filtering

Common filter parameters across list endpoints:

- **Search**: `search={query}` - Full-text search
- **Date Range**: `from_date={ISO8601}&to_date={ISO8601}`
- **Status**: `status={value}` - Filter by enum status
- **Tags**: `tags={tag1,tag2}` - Filter by tags (OR logic)

### 7.3 Sorting

**Query Parameter**: `sort={field}:{direction}`
- Direction: `asc` or `desc`
- Example: `sort=created_at:desc`

Common sortable fields:
- `created_at`, `updated_at`, `name`, `email`

## 8. Versioning & Deprecation

### 8.1 API Versioning

- **Current Version**: v1
- **URL Format**: `/v1/{resource}`
- **Header** (alternative): `X-Requil-Version: 2025-10-26`

### 8.2 Deprecation Policy

- 6 months notice before deprecation
- Deprecated endpoints return `Warning` header
- Changelog maintained at `/v1/changelog`

### 8.3 Breaking vs Non-Breaking Changes

**Breaking Changes** (require new version):
- Removing endpoints or fields
- Changing response structure
- Adding required request fields
- Changing authentication method

**Non-Breaking Changes** (no version bump):
- Adding optional request fields
- Adding response fields
- Adding new endpoints
- Relaxing validation

## 9. Performance & Scalability

### 9.1 Performance Targets

- **Render P95**: < 300ms (after cache warm-up)
- **Send Accept P95**: < 1s (excluding transport time)
- **API Read P95**: < 100ms
- **API Write P95**: < 500ms

### 9.2 Optimization Strategies

#### Caching
- Template compilation cached in Redis (7 day TTL)
- Brand kit cached in Redis (1 hour TTL)
- AJV validators cached in memory
- Response caching for GET requests (ETag support)

#### Database
- Indexes on all foreign keys
- Composite indexes for common queries
- Partitioning for `events` table (monthly)
- Read replicas for analytics queries (post-MVP)

#### Batch Processing
- Send jobs > 500 recipients split into batches
- QStash manages concurrent batch execution
- Per-batch checkpointing in Redis

### 9.3 Scalability Considerations

- Horizontal scaling via stateless API servers
- Redis cluster for cache/rate limiting
- QStash handles queue distribution
- Database connection pooling (Supabase)
- CDN for static assets (templates, images)

## 10. Testing & Quality

### 10.1 API Testing Strategy

- **Unit Tests**: Business logic, validators, guardrails
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Critical user flows (post-MVP for dashboard)
- **Contract Tests**: OpenAPI spec validation

### 10.2 Test Coverage Requirements

- Business logic: > 80% coverage
- API endpoints: > 70% coverage
- Error handling: 100% coverage for critical paths

### 10.3 Quality Gates

- All tests pass in CI
- No linter errors (Biome)
- TypeScript type-check passes
- OpenAPI spec validates
- Performance benchmarks within targets

