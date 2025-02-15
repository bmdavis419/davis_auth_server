import { createSubjects } from '@openauthjs/openauth/subject';
import { createClient } from '@openauthjs/openauth/client';
import * as v from 'valibot';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

const providers = ['github'] as const;

export const AUTH = {
	subjects: createSubjects({
		user: v.object({
			id: v.string(),
			providerId: v.string(),
			provider: v.picklist(providers),
			email: v.pipe(
				v.string('Your email must be a string.'),
				v.nonEmpty('Please enter your email.'),
				v.email('The email address is badly formatted.')
			),
			name: v.nullable(v.string()),
			image: v.nullable(v.string())
		})
	}),
	client: createClient({
		clientID: 'demo-svelte-client',
		issuer: env.AUTH_SERVER_URL
	}),
	setTokens: async (event: RequestEvent, access: string, refresh: string) => {
		event.cookies.set('accessToken', access, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90
		});

		event.cookies.set('refreshToken', refresh, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 90
		});
	},
	clearTokens: async (event: RequestEvent) => {
		event.cookies.delete('accessToken', { path: '/' });
		event.cookies.delete('refreshToken', { path: '/' });
	},
	validate: async (event: RequestEvent) => {
		console.log('CALLED AUTH VALIDATE');

		const accessToken = event.cookies.get('accessToken');
		const refreshToken = event.cookies.get('refreshToken');

		if (!accessToken) {
			return null;
		}

		const verified = await AUTH.client.verify(AUTH.subjects, accessToken, {
			refresh: refreshToken
		});

		if (verified.err) {
			return null;
		}

		if (verified.tokens) {
			await AUTH.setTokens(event, verified.tokens.access, verified.tokens.refresh);
		}

		return verified.subject;
	}
};
