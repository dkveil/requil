import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
	throw new Error('NEXT_PUBLIC_SUPABASE_URL must be set in environment');
}

const supabaseAdmin = supabaseServiceKey
	? createClient(supabaseUrl, supabaseServiceKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		})
	: null;

if (!supabaseServiceKey) {
	console.warn(
		'\n⚠️  SUPABASE_SERVICE_ROLE_KEY not set - user cleanup will be skipped!\n'
	);
}

export interface TestUser {
	email: string;
	password: string;
	userId?: string;
}

export class SupabaseTestHelper {
	private createdUserIds: Set<string> = new Set();
	private createdEmails: Set<string> = new Set();

	async deleteUserByEmail(email: string): Promise<void> {
		if (!supabaseAdmin) {
			console.warn(`⚠️  Cannot delete user ${email} - no service role key`);
			return;
		}

		try {
			const { data: users, error: listError } =
				await supabaseAdmin.auth.admin.listUsers();

			if (listError) {
				console.error('Error listing users:', listError);
				return;
			}

			const user = users.users.find((u) => u.email === email);

			if (user) {
				const { error: deleteError } =
					await supabaseAdmin.auth.admin.deleteUser(user.id);

				if (deleteError) {
					console.error(`Error deleting user ${email}:`, deleteError);
				} else {
					console.log(`✓ Deleted test user: ${email}`);
				}
			}
		} catch (error) {
			console.error(`Failed to delete user ${email}:`, error);
		}
	}

	async deleteUserById(userId: string): Promise<void> {
		if (!supabaseAdmin) {
			console.warn(`⚠️  Cannot delete user ${userId} - no service role key`);
			return;
		}

		try {
			const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

			if (error) {
				console.error(`Error deleting user ${userId}:`, error);
			} else {
				console.log(`✓ Deleted test user ID: ${userId}`);
			}
		} catch (error) {
			console.error(`Failed to delete user ${userId}:`, error);
		}
	}

	trackUser(email: string, userId?: string): void {
		this.createdEmails.add(email);
		if (userId) {
			this.createdUserIds.add(userId);
		}
	}

	async cleanupTrackedUsers(): Promise<void> {
		if (!supabaseAdmin) {
			console.warn(
				`\n⚠️  Skipping cleanup of ${this.createdEmails.size} test user(s) - no service role key\n`
			);
			return;
		}

		console.log(
			`\n🧹 Cleaning up ${this.createdEmails.size} tracked test user(s)...`
		);

		for (const userId of this.createdUserIds) {
			await this.deleteUserById(userId);
		}

		for (const email of this.createdEmails) {
			await this.deleteUserByEmail(email);
		}

		this.createdUserIds.clear();
		this.createdEmails.clear();

		console.log('✓ Cleanup complete\n');
	}

	async getUserByEmail(email: string) {
		if (!supabaseAdmin) {
			console.warn(`⚠️  Cannot get user ${email} - no service role key`);
			return null;
		}

		const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

		if (error) {
			throw error;
		}

		return users.users.find((u) => u.email === email);
	}

	async userExists(email: string): Promise<boolean> {
		const user = await this.getUserByEmail(email);
		return !!user;
	}
}

export const supabaseTestHelper = new SupabaseTestHelper();
