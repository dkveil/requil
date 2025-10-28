import type { Example } from '@requil/db';

export type ExampleResponseDto = Omit<Example, 'createdAt' | 'updatedAt'> & {
	createdAt: string;
	updatedAt: string;
};
