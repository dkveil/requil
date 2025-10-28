import type { Pagination } from '@/shared/db/repository.port';
import type { ExampleResponseDto } from './example.response.dto';

export interface PaginatedExampleResponseDto {
	data: ExampleResponseDto[];
	pagination: Pagination;
}
