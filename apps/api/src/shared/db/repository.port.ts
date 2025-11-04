import type {
	Paginated,
	PaginatedQueryParams,
	Pagination,
} from '@requil/types/api';

export type { PaginatedQueryParams, Pagination, Paginated };

export type OrderBy = {
	field: string;
	direction: 'asc' | 'desc';
};

export type RepositoryPort<Entity, TId = string> = {
	create: (entity: Entity | Entity[]) => Promise<void>;
	findOneById: (id: TId) => Promise<Entity | undefined>;
	delete: (id: TId) => Promise<void>;
	findAll: (params: PaginatedQueryParams) => Promise<Entity[]>;
	findAllPaginated: (
		params: PaginatedQueryParams
	) => Promise<Paginated<Entity>>;
};
