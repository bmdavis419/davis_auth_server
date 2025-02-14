## STEPS TO DO THIS SHIT

1. Create a new worker: `wrangler init <NAME>`
2. Create a new KV namespace: `npx wrangler kv namespace create <BINDING_NAME>`
3. Add the KV namespace to your wrangler config. Will be outputted when you create the KV namespace.
4. Add in your open auth code.
5. Add in your github oauth credentials. Set the redirect URL to be whatever your callback URL is in your APP (not this server)

## TODO

- [x] deploy
- [ ] document this
- [ ] add in a sveltekit example
- [ ] add in a .dev.vars example

## NOTES

- redirect url is `<YOUR_WORKER_URL>/github/callback`
