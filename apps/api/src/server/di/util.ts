const FORMAT_REGEX = /[.-]/;

export function formatName(fileName: string): string {
	return fileName
		.split(FORMAT_REGEX)
		.map((part, index) =>
			index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
		)
		.join('');
}
