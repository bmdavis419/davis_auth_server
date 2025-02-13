import { subjects } from "./subjects";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { issuer } from "@openauthjs/openauth";
import { GithubProvider } from "@openauthjs/openauth/provider/github";

declare global {
  interface Env {
    davis_auth_server: KVNamespace;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  }
}

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

      const emailData = (await emailInfo.json()) as {
        email: string;
        primary: boolean;
        verified: boolean;
        visibility: string;
      }[];

      const primaryEmail = emailData.find((email) => email.primary);

      const githubUser = (await userInfo.json()) as {
        id: number;
      };

      const userData = {
        id: githubUser.id.toString(),
        email: primaryEmail?.email ?? "bad man",
      };

      return userData;
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
      success: async (ctx, value) => {
        if (value.provider === "github") {
          console.log("GITHUB ID :0", value.clientID);

          const user = await getUser(value.tokenset.access);

          return ctx.subject("user", {
            id: user.id,
            email: user.email,
          });
        }
        throw new Error("Invalid provider");
      },
    }).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
