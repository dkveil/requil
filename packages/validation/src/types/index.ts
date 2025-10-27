export type { FormattedValidationError } from '../middleware/error-formatter';
export type { ValidatorSchema } from '../middleware/fastify-validator';
export type {
	ApiKeyQuery,
	ApiKeyScope,
	CreateApiKey,
	UpdateApiKey,
} from '../schemas/api-key';
export type {
	Attachment,
	FromAddress,
	Recipient,
	SendBatchRequest,
	SendErrorResponse,
	SendRequest,
	SendResponse,
	TemplateRef,
} from '../schemas/send';
export type {
	BulkImportSubscribers,
	ConfirmSubscription,
	CreateSubscriber,
	SubscriberQuery,
	Unsubscribe,
	UpdateSubscriber,
} from '../schemas/subscriber';
export type {
	CreateTemplate,
	PublishTemplate,
	TemplateQuery,
	UpdateTemplate,
	ValidateTemplate,
	ValidateTemplateResponse,
} from '../schemas/template';
export type {
	CreateTransport,
	TransportType,
	UpdateTransport,
	VerifyTransport,
} from '../schemas/transport';

export type { UsageQuery, UsageResponse } from '../schemas/usage';
export type {
	CreateWebhook,
	TestWebhook,
	UpdateWebhook,
	WebhookEvent,
	WebhookQuery,
} from '../schemas/webhook';
export type {
	AcceptInvitation,
	CreateWorkspace,
	InviteMember,
	UpdateBrandkit,
	UpdateMemberRole,
	UpdateWorkspace,
} from '../schemas/workspace';
export type {
	EmailValidationOptions,
	EmailValidationResult,
} from '../validators/email';

export type { GuardrailResult } from '../validators/guardrails';
export type { MjmlValidationResult } from '../validators/mjml';
export type {
	ValidationMode,
	VariableValidationResult,
} from '../validators/variables';
