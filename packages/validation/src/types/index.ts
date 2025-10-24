export type { FormattedValidationError } from '../middleware/error-formatter.js';
export type { ValidatorSchema } from '../middleware/fastify-validator.js';
export type {
	ApiKeyQuery,
	ApiKeyScope,
	CreateApiKey,
	UpdateApiKey,
} from '../schemas/api-key.js';
export type {
	Attachment,
	FromAddress,
	Recipient,
	SendBatchRequest,
	SendErrorResponse,
	SendRequest,
	SendResponse,
	TemplateRef,
} from '../schemas/send.js';
export type {
	BulkImportSubscribers,
	ConfirmSubscription,
	CreateSubscriber,
	SubscriberQuery,
	Unsubscribe,
	UpdateSubscriber,
} from '../schemas/subscriber.js';
export type {
	CreateTemplate,
	PublishTemplate,
	TemplateQuery,
	UpdateTemplate,
	ValidateTemplate,
	ValidateTemplateResponse,
} from '../schemas/template.js';
export type {
	CreateTransport,
	TransportType,
	UpdateTransport,
	VerifyTransport,
} from '../schemas/transport.js';

export type { UsageQuery, UsageResponse } from '../schemas/usage.js';
export type {
	CreateWebhook,
	TestWebhook,
	UpdateWebhook,
	WebhookEvent,
	WebhookQuery,
} from '../schemas/webhook.js';
export type {
	AcceptInvitation,
	CreateWorkspace,
	InviteMember,
	UpdateBrandkit,
	UpdateMemberRole,
	UpdateWorkspace,
} from '../schemas/workspace.js';
export type {
	EmailValidationOptions,
	EmailValidationResult,
} from '../validators/email.js';

export type { GuardrailResult } from '../validators/guardrails.js';
export type { MjmlValidationResult } from '../validators/mjml.js';
export type {
	ValidationMode,
	VariableValidationResult,
} from '../validators/variables.js';
