import type { UpdateWorkspaceInput } from '@requil/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Action } from '@/shared/cqrs/bus.types';
import { WorkspaceEntity } from '../../domain/workspace.domain';
import {
	WorkspaceAuthorizationError,
	WorkspaceConflictError,
	WorkspaceNotFoundError,
} from '../../domain/workspace.error';
import updateWorkspaceHandler from './update-workspace.handler';

describe('UpdateWorkspaceHandler', () => {
	let handler: ReturnType<typeof updateWorkspaceHandler>;
	let mockWorkspaceRepository: {
		findPersonalByUserId: ReturnType<typeof vi.fn>;
		findByIdWithRole: ReturnType<typeof vi.fn>;
		existsBySlug: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
	};
	let mockCommandBus: {
		register: ReturnType<typeof vi.fn>;
	};
	let mockLogger: {
		info: ReturnType<typeof vi.fn>;
		error: ReturnType<typeof vi.fn>;
	};

	const mockWorkspace = WorkspaceEntity.create(
		{
			name: 'Old Workspace',
			slug: 'old-workspace',
		},
		'user-1'
	);

	beforeEach(() => {
		mockWorkspaceRepository = {
			findPersonalByUserId: vi.fn(),
			findByIdWithRole: vi.fn(),
			existsBySlug: vi.fn(),
			update: vi.fn(),
		};

		mockCommandBus = {
			register: vi.fn(),
		};

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
		};

		handler = updateWorkspaceHandler({
			commandBus: mockCommandBus,
			workspaceRepository: mockWorkspaceRepository,
			logger: mockLogger,
		} as unknown as Dependencies);
	});

	it('should update workspace name successfully', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Workspace Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		const updatedWorkspace = WorkspaceEntity.create(
			{
				name: 'New Workspace Name',
				slug: 'old-workspace',
			},
			'user-1'
		);

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace);

		const result = await handler.handler(action);

		expect(result.name).toBe('New Workspace Name');
		expect(result.slug).toBe('old-workspace');
		expect(mockWorkspaceRepository.update).toHaveBeenCalledWith(
			mockWorkspace.id,
			{ name: 'New Workspace Name' }
		);
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				workspaceId: updatedWorkspace.id,
			}),
			'Workspace updated successfully'
		);
	});

	it('should update workspace slug successfully', async () => {
		const payload: UpdateWorkspaceInput = {
			slug: 'new-workspace-slug',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		const updatedWorkspace = WorkspaceEntity.create(
			{
				name: 'Old Workspace',
				slug: 'new-workspace-slug',
			},
			'user-1'
		);

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.existsBySlug.mockResolvedValue(false);
		mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace);

		const result = await handler.handler(action);

		expect(result.slug).toBe('new-workspace-slug');
		expect(mockWorkspaceRepository.existsBySlug).toHaveBeenCalledWith(
			'new-workspace-slug'
		);
		expect(mockWorkspaceRepository.update).toHaveBeenCalledWith(
			mockWorkspace.id,
			{ slug: 'new-workspace-slug' }
		);
	});

	it('should update both name and slug successfully', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
			slug: 'new-slug',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		const updatedWorkspace = WorkspaceEntity.create(
			{
				name: 'New Name',
				slug: 'new-slug',
			},
			'user-1'
		);

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.existsBySlug.mockResolvedValue(false);
		mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace);

		const result = await handler.handler(action);

		expect(result.name).toBe('New Name');
		expect(result.slug).toBe('new-slug');
	});

	it('should throw NotFoundError if workspace not found', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(null);

		await expect(handler.handler(action)).rejects.toThrow(
			WorkspaceNotFoundError
		);
		await expect(handler.handler(action)).rejects.toThrow(
			'Workspace not found or you do not have owner access'
		);
	});

	it('should throw AuthorizationError if user is not owner', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'member',
			memberSince: new Date().toISOString(),
		});

		await expect(handler.handler(action)).rejects.toThrow(
			WorkspaceAuthorizationError
		);
		await expect(handler.handler(action)).rejects.toThrow(
			'Owner role required to update workspace'
		);
	});

	it('should throw ConflictError if slug already exists', async () => {
		const payload: UpdateWorkspaceInput = {
			slug: 'existing-slug',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.existsBySlug.mockResolvedValue(true);

		await expect(handler.handler(action)).rejects.toThrow(
			WorkspaceConflictError
		);
		await expect(handler.handler(action)).rejects.toThrow(
			'Workspace slug already exists'
		);
	});

	it('should not check slug uniqueness if slug is not changing', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		const updatedWorkspace = WorkspaceEntity.create(
			{
				name: 'New Name',
				slug: 'old-workspace',
			},
			'user-1'
		);

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace);

		await handler.handler(action);

		expect(mockWorkspaceRepository.existsBySlug).not.toHaveBeenCalled();
	});

	it('should throw Error if userId is missing', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: {},
		};

		await expect(handler.handler(action)).rejects.toThrow(
			'User ID is required'
		);
	});

	it('should log operation duration', async () => {
		const payload: UpdateWorkspaceInput = {
			name: 'New Name',
		};

		const action: Action<UpdateWorkspaceInput> = {
			type: 'workspace/UPDATE_WORKSPACE',
			payload,
			meta: { userId: 'user-1' },
		};

		const updatedWorkspace = WorkspaceEntity.create(
			{
				name: 'New Name',
				slug: 'old-workspace',
			},
			'user-1'
		);

		mockWorkspaceRepository.findPersonalByUserId.mockResolvedValue(
			mockWorkspace
		);
		mockWorkspaceRepository.findByIdWithRole.mockResolvedValue({
			...mockWorkspace.toPersistence(),
			role: 'owner',
			memberSince: new Date().toISOString(),
		});
		mockWorkspaceRepository.update.mockResolvedValue(updatedWorkspace);

		await handler.handler(action);

		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.objectContaining({
				duration: expect.any(Number),
			}),
			'Workspace updated successfully'
		);
	});

	it('should register handler in command bus on init', async () => {
		await handler.init();

		expect(mockCommandBus.register).toHaveBeenCalledWith(
			'workspace/UPDATE_WORKSPACE',
			expect.any(Function)
		);
	});
});
