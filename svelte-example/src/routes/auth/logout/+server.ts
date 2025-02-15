import { AUTH } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const GET = (event) => {
	AUTH.clearTokens(event);

	return redirect(302, '/');
};
