import { describe, expect, it } from 'vitest';
import { createChildLogger, createTraceId, logger } from '../logger.js';

const TRACE_ID_REGEX = /^[A-Za-z0-9_-]+$/;

describe('logger utils', () => {
	describe('createTraceId', () => {
		it('should generate trace ID of correct length', () => {
			const traceId = createTraceId();
			expect(traceId).toHaveLength(21);
		});

		it('should generate unique trace IDs', () => {
			const id1 = createTraceId();
			const id2 = createTraceId();
			expect(id1).not.toBe(id2);
		});

		it('should generate alphanumeric trace IDs', () => {
			const traceId = createTraceId();
			expect(traceId).toMatch(TRACE_ID_REGEX);
		});
	});

	describe('logger', () => {
		it('should have basic pino methods', () => {
			expect(logger.info).toBeDefined();
			expect(logger.error).toBeDefined();
			expect(logger.warn).toBeDefined();
			expect(logger.debug).toBeDefined();
		});
	});

	describe('createChildLogger', () => {
		it('should create child logger with traceId', () => {
			const traceId = createTraceId();
			const childLogger = createChildLogger(traceId);

			expect(childLogger).toBeDefined();
			expect(childLogger.info).toBeDefined();
		});

		it('should include traceId in child logger bindings', () => {
			const traceId = 'test-trace-id-123';
			const childLogger = createChildLogger(traceId);

			const bindings = childLogger.bindings();
			expect(bindings.traceId).toBe(traceId);
		});
	});
});
