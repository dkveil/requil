import type { Pagination } from '@requil/types/api';
import type { ExampleResponseDto } from './example.response.dto';

export interface PaginatedExampleResponseDto {
	data: ExampleResponseDto[];
	pagination: Pagination;
}
