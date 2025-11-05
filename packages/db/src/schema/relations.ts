import { relations } from 'drizzle-orm/relations';
import { apiKeyScopes, apiKeys } from './api-keys';
import { events } from './events';
import { sendJobs, sendRecipients } from './sending';
import { subscribers, subscriberTags } from './subscribers';
import { suppression } from './suppression';
import { templateSnapshots, templates } from './templates';
import { usageCountersDaily } from './usage';
import {
	workspaceBrandkit,
	workspaceInvitations,
	workspaceMembers,
	workspacePlans,
	workspaces,
	workspaceTransports,
} from './workspace';

export const subscribersRelations = relations(subscribers, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [subscribers.workspaceId],
		references: [workspaces.id],
	}),
	subscriberTags: many(subscriberTags),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
	subscribers: many(subscribers),
	workspacePlans: many(workspacePlans),
	workspaceInvitations: many(workspaceInvitations),
	apiKeys: many(apiKeys),
	templates: many(templates),
	workspaceBrandkits: many(workspaceBrandkit),
	workspaceTransports: many(workspaceTransports),
	sendJobs: many(sendJobs),
	sendRecipients: many(sendRecipients),
	suppressions: many(suppression),
	workspaceMembers: many(workspaceMembers),
	usageCountersDailies: many(usageCountersDaily),
	events: many(events),
}));

export const workspacePlansRelations = relations(workspacePlans, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [workspacePlans.workspaceId],
		references: [workspaces.id],
	}),
}));

export const workspaceInvitationsRelations = relations(
	workspaceInvitations,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceInvitations.workspaceId],
			references: [workspaces.id],
		}),
	})
);

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [apiKeys.workspaceId],
		references: [workspaces.id],
	}),
	apiKeyScopes: many(apiKeyScopes),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [templates.workspaceId],
		references: [workspaces.id],
	}),
	templateSnapshot: one(templateSnapshots, {
		fields: [templates.currentSnapshotId],
		references: [templateSnapshots.id],
		relationName: 'templates_currentSnapshotId_templateSnapshots_id',
	}),
	templateSnapshots: many(templateSnapshots, {
		relationName: 'templateSnapshots_templateId_templates_id',
	}),
}));

export const templateSnapshotsRelations = relations(
	templateSnapshots,
	({ one, many }) => ({
		templates: many(templates, {
			relationName: 'templates_currentSnapshotId_templateSnapshots_id',
		}),
		template: one(templates, {
			fields: [templateSnapshots.templateId],
			references: [templates.id],
			relationName: 'templateSnapshots_templateId_templates_id',
		}),
		sendJobs: many(sendJobs),
		events: many(events),
	})
);

export const workspaceBrandkitRelations = relations(
	workspaceBrandkit,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceBrandkit.workspaceId],
			references: [workspaces.id],
		}),
	})
);

export const workspaceTransportsRelations = relations(
	workspaceTransports,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceTransports.workspaceId],
			references: [workspaces.id],
		}),
	})
);

export const sendJobsRelations = relations(sendJobs, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [sendJobs.workspaceId],
		references: [workspaces.id],
	}),
	templateSnapshot: one(templateSnapshots, {
		fields: [sendJobs.templateSnapshotId],
		references: [templateSnapshots.id],
	}),
	sendRecipients: many(sendRecipients),
	events: many(events),
}));

export const sendRecipientsRelations = relations(sendRecipients, ({ one }) => ({
	sendJob: one(sendJobs, {
		fields: [sendRecipients.jobId],
		references: [sendJobs.id],
	}),
	workspace: one(workspaces, {
		fields: [sendRecipients.workspaceId],
		references: [workspaces.id],
	}),
}));

export const subscriberTagsRelations = relations(subscriberTags, ({ one }) => ({
	subscriber: one(subscribers, {
		fields: [subscriberTags.subscriberId],
		references: [subscribers.id],
	}),
}));

export const apiKeyScopesRelations = relations(apiKeyScopes, ({ one }) => ({
	apiKey: one(apiKeys, {
		fields: [apiKeyScopes.apiKeyId],
		references: [apiKeys.id],
	}),
}));

export const suppressionRelations = relations(suppression, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [suppression.workspaceId],
		references: [workspaces.id],
	}),
}));

export const workspaceMembersRelations = relations(
	workspaceMembers,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [workspaceMembers.workspaceId],
			references: [workspaces.id],
		}),
	})
);

export const usageCountersDailyRelations = relations(
	usageCountersDaily,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [usageCountersDaily.workspaceId],
			references: [workspaces.id],
		}),
	})
);

export const eventsRelations = relations(events, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [events.workspaceId],
		references: [workspaces.id],
	}),
	sendJob: one(sendJobs, {
		fields: [events.jobId],
		references: [sendJobs.id],
	}),
	templateSnapshot: one(templateSnapshots, {
		fields: [events.templateSnapshotId],
		references: [templateSnapshots.id],
	}),
}));
