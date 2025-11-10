import { db } from '@requil/db';
import { asc, count, desc, eq, getTableName, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { FastifyBaseLogger } from 'fastify';
import type {
	Paginated,
	PaginatedQueryParams,
	RepositoryPort,
} from './repository.port';

export type DBType = typeof db;

export type EntityMapper<Entity, PersistenceModel> = {
	toPersistence: (entity: Entity) => PersistenceModel;
	toDomain: (model: PersistenceModel) => Entity;
};

export type RepositoryBaseProps<Entity, PersistenceModel> = {
	db: DBType;
	logger: FastifyBaseLogger;
	table: PgTable;
	mapper: EntityMapper<Entity, PersistenceModel>;
	idColumn?: PgColumn;
};

export function RepositoryBase<
	Entity,
	PersistenceModel extends Record<string, unknown>,
>({
	db,
	logger,
	table,
	mapper,
	idColumn,
}: RepositoryBaseProps<Entity, PersistenceModel>): RepositoryPort<
	Entity,
	string
> {
	// Use the first column as idColumn if not provided
	const columns = Object.values(table);
	const defaultIdColumn = columns.find(
		(col): col is PgColumn =>
			typeof col === 'object' && col !== null && 'name' in col
	);
	const id = idColumn ?? defaultIdColumn;

	if (!id) {
		throw new Error('No id column found in table');
	}

	// const create = async (entity: Entity | Entity[]): Promise<Entity | Entity[]> => {
	// 	if (Array.isArray(entity)) {
	// 		const dataArray = entity.map(mapper.toPersistence);
	// 		// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert requires any for dynamic values
	// 		const result = await db.insert(table).values(dataArray as any).returning();
	// 		logger.info({ count: dataArray.length }, 'Created multiple entities');
	// 		return result.map((data) => mapper.toDomain(data as PersistenceModel));
	// 	}

	// 	const data = mapper.toPersistence(entity);
	// 	// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert requires any for dynamic values
	// 	await db.insert(table).values(data as any);
	// 	logger.info('Created entity');
	// };

	const create = async (entity: Entity): Promise<Entity> => {
		const data = mapper.toPersistence(entity);
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert requires any for dynamic values
		await db.insert(table).values(data as any);
		logger.info('Created entity');
		return entity;
	};

	const createMany = async (entities: Entity[]): Promise<Entity[]> => {
		const dataArray = entities.map(mapper.toPersistence);
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert requires any for dynamic values
		const result = await db
			.insert(table)
			.values(dataArray as any)
			.returning();
		logger.info({ count: dataArray.length }, 'Created multiple entities');
		return result.map((data) => mapper.toDomain(data as PersistenceModel));
	};

	const findOneById = async (entityId: string): Promise<Entity | undefined> => {
		const tableName = getTableName(table);
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic table query access
		const queryTable = (db.query as any)[tableName];

		if (!queryTable) {
			throw new Error(`Table ${tableName} not found in db.query`);
		}

		const result = await queryTable.findFirst({
			where: eq(id, entityId),
		});

		return result ? mapper.toDomain(result as PersistenceModel) : undefined;
	};

	const deleteRecord = async (entityId: string): Promise<void> => {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle delete requires any for dynamic where clause
		await db.delete(table).where(eq(id, entityId) as any);
		logger.info({ id: entityId }, 'Deleted entity');
	};

	const findAll = async (params: PaginatedQueryParams): Promise<Entity[]> => {
		const { limit, offset = 0, orderBy: orderByParam } = params;

		let orderByClause: SQL | undefined;
		if (orderByParam) {
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic column access
			const column = (table as any)[orderByParam.field] as PgColumn | undefined;
			if (column && 'name' in column) {
				orderByClause =
					orderByParam.direction === 'asc' ? asc(column) : desc(column);
			}
		}

		if (!orderByClause) {
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic column access
			const createdAtCol = (table as any).createdAt as PgColumn | undefined;
			orderByClause = createdAtCol ? desc(createdAtCol) : desc(id);
		}

		// biome-ignore lint/suspicious/noExplicitAny: Drizzle query builder requires any for dynamic table
		const results = await db
			.select()
			.from(table as any)
			.orderBy(orderByClause)
			.limit(limit)
			.offset(offset);

		return results.map((row) => mapper.toDomain(row as PersistenceModel));
	};

	const countRecords = async (): Promise<number> => {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle query builder requires any for dynamic table
		const [result] = await db.select({ count: count() }).from(table as any);

		return result?.count ?? 0;
	};

	const findAllPaginated = async (
		params: PaginatedQueryParams
	): Promise<Paginated<Entity>> => {
		const { limit, offset = 0 } = params;
		const page = Math.floor(offset / limit);

		const [entities, totalCount] = await Promise.all([
			findAll(params),
			countRecords(),
		]);

		return {
			data: entities,
			pagination: {
				total: totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	};

	return {
		create,
		createMany,
		findOneById,
		delete: deleteRecord,
		findAll,
		findAllPaginated,
	};
}
