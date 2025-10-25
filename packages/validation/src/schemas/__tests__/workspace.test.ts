import { describe, expect, it } from 'vitest';
import {
	acceptInvitationSchema,
	createWorkspaceSchema,
	inviteMemberSchema,
	updateBrandkitSchema,
	updateMemberRoleSchema,
	updateWorkspaceSchema,
} from '../workspace';

describe('workspace schemas', () => {
	describe('createWorkspaceSchema', () => {
		it('should validate workspace with required fields', () => {
			const data = {
				name: 'Acme Inc',
				slug: 'acme-inc',
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate slug format', () => {
			const data = {
				name: 'Test Company',
				slug: 'invalid_slug',
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should accept valid slug with hyphens', () => {
			const data = {
				name: 'Test Company',
				slug: 'test-company-2025',
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate with description', () => {
			const data = {
				name: 'Acme Inc',
				slug: 'acme-inc',
				description: 'A company that makes great products',
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce name length', () => {
			const data = {
				name: 'a'.repeat(256),
				slug: 'test',
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce slug length', () => {
			const data = {
				name: 'Test',
				slug: 'a'.repeat(64),
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce description length', () => {
			const data = {
				name: 'Test',
				slug: 'test',
				description: 'a'.repeat(1001),
			};

			const result = createWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateWorkspaceSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				name: 'Updated Company Name',
			};

			const result = updateWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate description update', () => {
			const data = {
				description: 'Updated description',
			};

			const result = updateWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate multiple field updates', () => {
			const data = {
				name: 'New Name',
				description: 'New description',
			};

			const result = updateWorkspaceSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});

	describe('inviteMemberSchema', () => {
		it('should validate member invitation', () => {
			const data = {
				email: 'member@example.com',
			};

			const result = inviteMemberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should apply default role', () => {
			const data = {
				email: 'member@example.com',
			};

			const result = inviteMemberSchema.parse(data);
			expect(result.role).toBe('member');
		});

		it('should validate with owner role', () => {
			const data = {
				email: 'owner@example.com',
				role: 'owner',
			};

			const result = inviteMemberSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const data = {
				email: 'invalid-email',
			};

			const result = inviteMemberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject invalid role', () => {
			const data = {
				email: 'member@example.com',
				role: 'admin',
			};

			const result = inviteMemberSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('acceptInvitationSchema', () => {
		it('should validate invitation acceptance', () => {
			const data = {
				token: 'invitation-token-123',
			};

			const result = acceptInvitationSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should require token', () => {
			const data = {};

			const result = acceptInvitationSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject empty token', () => {
			const data = {
				token: '',
			};

			const result = acceptInvitationSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateMemberRoleSchema', () => {
		it('should validate role update to owner', () => {
			const data = {
				role: 'owner',
			};

			const result = updateMemberRoleSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate role update to member', () => {
			const data = {
				role: 'member',
			};

			const result = updateMemberRoleSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid role', () => {
			const data = {
				role: 'admin',
			};

			const result = updateMemberRoleSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require role', () => {
			const data = {};

			const result = updateMemberRoleSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('updateBrandkitSchema', () => {
		it('should validate partial brandkit updates', () => {
			const data = {
				logo: 'https://example.com/logo.png',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject empty updates', () => {
			const data = {};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate hex color format', () => {
			const data = {
				primaryColor: '#FF5733',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid hex color', () => {
			const data = {
				primaryColor: 'FF5733',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject short hex color', () => {
			const data = {
				primaryColor: '#FFF',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate with all fields', () => {
			const data = {
				logo: 'https://example.com/logo.png',
				primaryColor: '#FF5733',
				secondaryColor: '#33FF57',
				fontFamily: 'Inter',
				customCss: '.custom { color: red; }',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should enforce font family length', () => {
			const data = {
				fontFamily: 'a'.repeat(101),
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should enforce custom CSS length', () => {
			const data = {
				customCss: 'a'.repeat(10001),
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate secondary color format', () => {
			const data = {
				secondaryColor: '#ABCDEF',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should accept lowercase hex colors', () => {
			const data = {
				primaryColor: '#ff5733',
			};

			const result = updateBrandkitSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});
