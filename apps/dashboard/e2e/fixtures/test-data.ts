export const TEST_USER = {
	email: process.env.E2E_USERNAME || 'test@example.com',
	password: process.env.E2E_PASSWORD || 'test-password-123',
};

export const TEST_WORKSPACE = {
	name: 'Test Workspace',
	slug: 'test-workspace',
};

export const TEST_TEMPLATE = {
	name: 'Test Template',
	subject: 'Test Subject',
};
