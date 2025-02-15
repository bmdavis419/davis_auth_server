import { AUTH } from '$lib/auth';
import { json, redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	// get callback url
	const baseUrl = event.url.origin;
	const callbackUrl = `${baseUrl}/auth/github/callback`;

	// get auth code
	const curUrl = new URL(event.request.url);
	const code = curUrl.searchParams.get('code');
	if (!code) {
		return json({ error: 'No code provided' }, { status: 400 });
	}

	// exchange code for tokens
	const exchanged = await AUTH.client.exchange(code, callbackUrl);
	if (exchanged.err) {
		return json({ error: 'Invalid code' }, { status: 400 });
	}

	// set tokens
	await AUTH.setTokens(event, exchanged.tokens.access, exchanged.tokens.refresh);

	// redirect to home
	return redirect(302, '/');
};
