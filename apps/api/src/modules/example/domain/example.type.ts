import type { Example, NewExample } from '@requil/db';

export type ExampleId = Example['id'];

export type ExampleProps = Example;

export type CreateExampleProps = Pick<NewExample, 'name'>;

export type UpdateExampleProps = Partial<Pick<Example, 'name'>>;
