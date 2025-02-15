import { subjects } from "./subjects";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { issuer } from "@openauthjs/openauth";
import { GithubProvider } from "@openauthjs/openauth/provider/github";

declare global {
  interface Env {
    davis_auth_server: KVNamespace;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ALLOWED_DOMAINS: string;
  }
}

// TODO save user to DB
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const getUser = async (accessToken: string) => {
      const [userInfo, emailInfo] = await Promise.all([
        fetch(`https://api.github.com/user`, {
          headers: {
            "User-Agent": "Davis Auth",
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }),
        fetch(`https://api.github.com/user/emails`, {
          headers: {
            "User-Agent": "Davis Auth",
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }),
      ]);

      const [userData, emailData] = await Promise.all([
        userInfo.json() as Promise<{
          id: number;
          name: string | null;
          avatar_url: string | null;
        }>,
        emailInfo.json() as Promise<
          {
            email: string;
            primary: boolean;
            verified: boolean;
            visibility: string;
          }[]
        >,
      ]);

      const primaryEmail = emailData.find((email) => email.primary);

      if (!primaryEmail) {
        throw new Error("No primary email found");
      }

      const user = {
        id: crypto.randomUUID(),
        email: primaryEmail.email,
        providerId: userData.id.toString(),
        provider: "github" as const,
        name: userData.name,
        image: userData.avatar_url,
      };

      return user;
    };

    return issuer({
      subjects,
      storage: CloudflareStorage({
        namespace: env.davis_auth_server,
      }),
      providers: {
        github: GithubProvider({
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          scopes: ["user:email"],
        }),
      },
      allow: async (input) => {
        if (input.redirectURI.startsWith("http://localhost")) {
          return true;
        }

        const allowedRedirectURIs = env.ALLOWED_DOMAINS.split(",");

        const allowedRedirectURI = allowedRedirectURIs.find((uri) =>
          input.redirectURI.startsWith(uri)
        );

        return !!allowedRedirectURI;
      },
      success: async (ctx, value) => {
        if (value.provider === "github") {
          const user = await getUser(value.tokenset.access);

          return ctx.subject("user", user);
        }
        throw new Error("Invalid provider");
      },
    }).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
