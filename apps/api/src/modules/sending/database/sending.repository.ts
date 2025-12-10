import { sendJobs, sendRecipients } from '@requil/db';
import { and, eq } from 'drizzle-orm';
import type {
	CreateJobWithRecipientsParams,
	CreateJobWithRecipientsResult,
	ISendingRepository,
	SendJobId,
	UpdateJobStatusParams,
	UpdateRecipientStatusParams,
	WorkspaceId,
} from './sending.repository.port';

export default function sendingRepository({
	db,
	logger,
}: Dependencies): ISendingRepository {
	const createJobWithRecipients = async (
		params: CreateJobWithRecipientsParams
	): Promise<CreateJobWithRecipientsResult> => {
		const result = await db.transaction(async (tx) => {
			const [job] = await tx.insert(sendJobs).values(params.job).returning();

			if (!job) {
				throw new Error('Failed to create send job');
			}

			const recipients = await tx
				.insert(sendRecipients)
				.values(params.recipients)
				.returning();

			return { job, recipients };
		});

		logger.info(
			{
				jobId: result.job.id,
				recipientCount: result.recipients.length,
			},
			'Created send job with recipients'
		);

		return result;
	};

	const findJobById = async (jobId: SendJobId) => {
		const [job] = await db
			.select()
			.from(sendJobs)
			.where(eq(sendJobs.id, jobId))
			.limit(1);

		return job;
	};

	const findJobByIdWithWorkspace = async (
		jobId: SendJobId,
		workspaceId: WorkspaceId
	) => {
		const [job] = await db
			.select()
			.from(sendJobs)
			.where(and(eq(sendJobs.id, jobId), eq(sendJobs.workspaceId, workspaceId)))
			.limit(1);

		return job;
	};

	const updateJobStatus = async (params: UpdateJobStatusParams) => {
		await db
			.update(sendJobs)
			.set({ status: params.status })
			.where(eq(sendJobs.id, params.jobId));

		logger.debug(
			{ jobId: params.jobId, status: params.status },
			'Updated job status'
		);
	};

	const findRecipientsByJobId = async (jobId: SendJobId) => {
		return await db
			.select()
			.from(sendRecipients)
			.where(eq(sendRecipients.jobId, jobId));
	};

	const updateRecipientStatus = async (params: UpdateRecipientStatusParams) => {
		const updateData: Record<string, unknown> = {
			status: params.status,
		};

		if (params.errorCode !== undefined) {
			updateData.errorCode = params.errorCode;
		}

		if (params.transportMessageId !== undefined) {
			updateData.transportMessageId = params.transportMessageId;
		}

		if (params.attempts !== undefined) {
			updateData.attempts = params.attempts;
		}

		if (params.firstSentAt !== undefined) {
			updateData.firstSentAt = params.firstSentAt;
		}

		if (params.lastAttemptAt !== undefined) {
			updateData.lastAttemptAt = params.lastAttemptAt;
		}

		await db
			.update(sendRecipients)
			.set(updateData)
			.where(eq(sendRecipients.id, params.recipientId));
	};

	const updateRecipientsStatusBatch = async (
		params: UpdateRecipientStatusParams[]
	) => {
		await db.transaction(async (tx) => {
			for (const recipientUpdate of params) {
				const updateData: Record<string, unknown> = {
					status: recipientUpdate.status,
				};

				if (recipientUpdate.errorCode !== undefined) {
					updateData.errorCode = recipientUpdate.errorCode;
				}

				if (recipientUpdate.transportMessageId !== undefined) {
					updateData.transportMessageId = recipientUpdate.transportMessageId;
				}

				if (recipientUpdate.attempts !== undefined) {
					updateData.attempts = recipientUpdate.attempts;
				}

				if (recipientUpdate.firstSentAt !== undefined) {
					updateData.firstSentAt = recipientUpdate.firstSentAt;
				}

				if (recipientUpdate.lastAttemptAt !== undefined) {
					updateData.lastAttemptAt = recipientUpdate.lastAttemptAt;
				}

				await tx
					.update(sendRecipients)
					.set(updateData)
					.where(eq(sendRecipients.id, recipientUpdate.recipientId));
			}
		});

		logger.debug(
			{ count: params.length },
			'Updated recipient statuses in batch'
		);
	};

	return {
		createJobWithRecipients,
		findJobById,
		findJobByIdWithWorkspace,
		updateJobStatus,
		findRecipientsByJobId,
		updateRecipientStatus,
		updateRecipientsStatusBatch,
	};
}
