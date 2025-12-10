import type {
	NewSendJob,
	NewSendRecipient,
	SendJob,
	SendRecipient,
} from '@requil/db';

export type SendJobId = string;
export type WorkspaceId = string;
export type RecipientId = string;

export interface CreateJobWithRecipientsParams {
	job: NewSendJob;
	recipients: NewSendRecipient[];
}

export interface CreateJobWithRecipientsResult {
	job: SendJob;
	recipients: SendRecipient[];
}

export interface UpdateJobStatusParams {
	jobId: SendJobId;
	status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface UpdateRecipientStatusParams {
	recipientId: RecipientId;
	status:
		| 'pending'
		| 'sent'
		| 'delivered'
		| 'bounced'
		| 'failed'
		| 'suppressed';
	errorCode?: string | null;
	transportMessageId?: string | null;
	attempts?: number;
	firstSentAt?: string | null;
	lastAttemptAt?: string | null;
}

export interface ISendingRepository {
	createJobWithRecipients(
		params: CreateJobWithRecipientsParams
	): Promise<CreateJobWithRecipientsResult>;

	findJobById(jobId: SendJobId): Promise<SendJob | undefined>;

	findJobByIdWithWorkspace(
		jobId: SendJobId,
		workspaceId: WorkspaceId
	): Promise<SendJob | undefined>;

	updateJobStatus(params: UpdateJobStatusParams): Promise<void>;

	findRecipientsByJobId(jobId: SendJobId): Promise<SendRecipient[]>;

	updateRecipientStatus(params: UpdateRecipientStatusParams): Promise<void>;

	updateRecipientsStatusBatch(
		params: UpdateRecipientStatusParams[]
	): Promise<void>;
}
