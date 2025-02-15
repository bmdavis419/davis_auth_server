import { AUTH } from '$lib/auth.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
	loginGithub: async (event) => {
		const baseUrl = event.url.origin;
		const callbackUrl = `${baseUrl}/auth/github/callback`;

		const { url } = await AUTH.client.authorize(callbackUrl, 'code');

		redirect(302, url);
	}
};
