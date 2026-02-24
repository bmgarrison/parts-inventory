import { parts } from '$lib/data';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const part = parts.find(p => p.id === params.id);
	
	if (!part) {
		throw error(404, 'Part not found');
	}

	return { part };
};

export const entries = () => {
	return parts.map(part => ({ id: part.id }));
};
