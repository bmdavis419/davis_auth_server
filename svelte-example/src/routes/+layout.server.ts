import { AUTH } from '$lib/auth.js';

export const load = async (event) => {
	const user = await AUTH.validate(event);

	return {
		user
	};
};
