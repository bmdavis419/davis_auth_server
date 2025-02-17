import * as v from "valibot";
import { createSubjects } from "@openauthjs/openauth/subject";

const providers = ["github"] as const;

export const subjects = createSubjects({
  user: v.object({
    id: v.string(),
    providerId: v.string(),
    provider: v.picklist(providers),
    email: v.pipe(
      v.string("Your email must be a string."),
      v.nonEmpty("Please enter your email."),
      v.email("The email address is badly formatted.")
    ),
    name: v.nullable(v.string()),
    image: v.nullable(v.string()),
  }),
});
