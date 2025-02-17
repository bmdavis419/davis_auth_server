# getting started

_this guide is for creating your own worker and copy pasting code from here_

0. Setup wrangler: https://developers.cloudflare.com/workers/wrangler/install-and-update/
1. Create a new worker: `wrangler init <NAME>`, select Hello World starter
2. Create a new KV namespace: `npx wrangler kv namespace create <BINDING_NAME>`
3. Add the KV namespace to your wrangler config. Will be outputted when you create the KV namespace.
4. Copy paste the code from `src/index.ts` & `src/subjects.ts` into your worker.
5. Update the ENV interface to use your KV namespace binding.
6. Add in your github oauth credentials. Details below. Add the vars to your `.dev.vars` file. (see example)
7. Start the worker: `pnpm run dev`

# deploying

1. `pnpm run deploy`
2. Update your app in cloudflare to include your env vars
3. Make sure that your github oauth app redirect URL is set to `<YOUR_WORKER_URL>/github/callback`

# auth server notes

### auth server code

- `src/index.ts` is the open auth server, docs here: https://openauth.js.org/docs/issuer/
- `src/subjects.ts` contains the user subject, which is just the shape of the user, docs here: https://openauth.js.org/docs/subject/

### env vars

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are used to authenticate with github. Docs for the github provide: https://openauth.js.org/docs/provider/github/. Get your client id and secret from here: https://github.com/settings/developers (OAuth apps). Set the redirect URL to be `<YOUR_WORKER_URL>/github/callback`

- `ALLOWED_DOMAINS` is the list of domains that are allowed to access the auth server. These should be the base urls of the apps that will use your auth server in a comma separated list. Localhost is automatically allowed.

### important functions

- `getUser` is the function that will get your github user info. It has to do two api requests to get the user info and then the user's emails. It will then cache the user in the KV namespace and return the user. This is called only on login, then cached in the KV namespace.

### kv namespace

- `davis_auth_server` is the KV namespace currently setup. You should create your own and use that instead of mine. (You can't access mine anyway, it's just a name).
- Docs on how to add one: https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace

### sveltekit example

- `svelte-example` is an example of a sveltekit app that uses this auth server
- Docs for how to use it are in the project's README
