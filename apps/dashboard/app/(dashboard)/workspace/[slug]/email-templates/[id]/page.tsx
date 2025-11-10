import { notFound, redirect } from 'next/navigation';

type Props = {
	params: {
		slug: string;
		id: string;
	};
};

export default async function EmailTemplateDetailPage({ params }: Props) {
	const { slug, id } = params;

	if (!(id && slug)) {
		notFound();
	}

	// Redirect to edit page for now
	redirect(`/workspace/${slug}/email-templates/${id}/edit`);
}
