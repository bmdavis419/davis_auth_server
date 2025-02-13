import { subjects } from "./subjects";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { issuer } from "@openauthjs/openauth";
import { GithubProvider } from "@openauthjs/openauth/provider/github";
import { Octokit } from "@octokit/core";

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
      const octokit = new Octokit({
        auth: accessToken,
      });

      const userInfo = await octokit.request("GET /user", {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      console.log(userInfo);

      const userData = {
        id: userInfo.data.id.toString(),
        email: userInfo.data.email ?? "bad man",
      };

      const user = await env.davis_auth_server.get(userData.id);

      if (!user) {
        await env.davis_auth_server.put(userData.id, userData.email);
      }

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
          scopes: ["email"],
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
