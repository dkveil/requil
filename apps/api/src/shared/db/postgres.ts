import { client } from '@requil/db';

export async function closeConnection(): Promise<void> {
	await client.end({ timeout: 5 });
}
