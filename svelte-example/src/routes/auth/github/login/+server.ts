import { AUTH } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const baseUrl = event.url.origin;
	const callbackUrl = `${baseUrl}/auth/github/callback`;

	const { url } = await AUTH.client.authorize(callbackUrl, 'code');

	return redirect(302, url);
};
