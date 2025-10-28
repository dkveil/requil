import type { Example } from '@requil/db';
import { ExampleValidationError } from './example.error';
import type {
	CreateExampleProps,
	ExampleId,
	ExampleProps,
} from './example.type';

export class ExampleEntity {
	private constructor(private readonly props: ExampleProps) {
		this.validate();
	}

	static create(props: CreateExampleProps): ExampleEntity {
		const now = new Date();
		return new ExampleEntity({
			id: crypto.randomUUID(),
			name: props.name.trim(),
			createdAt: now,
			updatedAt: now,
		});
	}

	static fromPersistence(props: Example): ExampleEntity {
		return new ExampleEntity(props);
	}

	private validate(): void {
		if (!this.props.name || this.props.name.trim().length === 0) {
			throw new ExampleValidationError('Name cannot be empty');
		}

		if (this.props.name.length < 3) {
			throw new ExampleValidationError(
				'Name must be at least 3 characters long'
			);
		}

		if (this.props.name.length > 100) {
			throw new ExampleValidationError(
				'Name must be at most 100 characters long'
			);
		}
	}

	updateName(name: string): void {
		this.props.name = name.trim();
		this.props.updatedAt = new Date();
		this.validate();
	}

	get id(): ExampleId {
		return this.props.id;
	}

	get name(): string {
		return this.props.name;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	toPersistence(): Example {
		return {
			id: this.props.id,
			name: this.props.name,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
		};
	}
}
