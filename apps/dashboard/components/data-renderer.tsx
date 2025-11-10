import Link from 'next/link';
import { DEFAULT_EMPTY, DEFAULT_ERROR } from '@/constants/states';
import { Button } from './ui/button';

type State = {
	title: string;
	message: string;
	button?: {
		text: string;
		link: string;
	};
};

type Props<T> = {
	success: boolean;
	error?: {
		message: string;
	};
	data: T | T[] | null | undefined;
	emptyState?: State;
	errorState?: State;
	render: (data: T | T[]) => React.ReactNode;
};

function StateSkeleton(props: State) {
	const { title, message, button } = props;

	return (
		<div className='flex min-h-[200px] w-full flex-col items-center justify-center gap-4'>
			<h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
			<p className='text-muted-foreground mt-1'>{message}</p>
			{button && (
				<Button
					className='bg-primary text-primary-foreground hover:bg-primary/90'
					asChild
				>
					<Link href={button.link}>{button.text}</Link>
				</Button>
			)}
		</div>
	);
}

export function DataRenderer<T>(props: Props<T>) {
	const {
		success,
		error,
		data,
		emptyState = DEFAULT_EMPTY,
		errorState = DEFAULT_ERROR,
		render,
	} = props;

	if (!success || error) {
		return <StateSkeleton {...errorState} />;
	}

	if (!data || (Array.isArray(data) && data.length === 0)) {
		return <StateSkeleton {...emptyState} />;
	}

	return render(data);
}
