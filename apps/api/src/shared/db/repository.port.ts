export type OrderBy = {
	field: string;
	direction: 'asc' | 'desc';
};

export type PaginatedQueryParams = {
	limit: number;
	offset: number;
	orderBy?: OrderBy;
};

export type Pagination = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type Paginated<T> = {
	data: T[];
	pagination: Pagination;
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
