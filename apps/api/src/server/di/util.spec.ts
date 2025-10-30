import { describe, expect, it } from 'vitest';
import { formatName } from '@/server/di/util';

describe('Awilix: formatName()', () => {
	it('should format user-test.repository correctly', () => {
		expect(formatName('user-test.repository')).toBe('userTestRepository');
	});

	it('should format user.repository correctly', () => {
		expect(formatName('user.repository')).toBe('userRepository');
	});

	it('should format user.mapper correctly', () => {
		expect(formatName('user.mapper')).toBe('userMapper');
	});
});
