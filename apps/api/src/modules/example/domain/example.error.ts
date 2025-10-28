export class ExampleNotFoundError extends Error {
	constructor(id: string) {
		super(`Example with id ${id} not found`);
		this.name = 'ExampleNotFoundError';
	}
}

export class ExampleValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ExampleValidationError';
	}
}

export class ExampleAlreadyExistsError extends Error {
	constructor(name: string) {
		super(`Example with name "${name}" already exists`);
		this.name = 'ExampleAlreadyExistsError';
	}
}
