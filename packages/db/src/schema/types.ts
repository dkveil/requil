import { customType } from 'drizzle-orm/pg-core';

export const citext = customType<{ data: string; driverData: string }>({
	dataType() {
		return 'citext';
	},
});

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return 'bytea';
	},
	toDriver(value: Buffer | Uint8Array): Buffer {
		return Buffer.isBuffer(value) ? value : Buffer.from(value);
	},
	fromDriver(value: Buffer | Uint8Array): Buffer {
		return Buffer.isBuffer(value) ? value : Buffer.from(value);
	},
});

export type UserRole = 'owner' | 'member';

export type AuthUser = {
	id: string;
	email: string;
	createdAt: string;
	emailConfirmed: boolean;
};
