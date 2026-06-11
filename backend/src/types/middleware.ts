import type { ICradle } from "@/lib/container";
import type { auth } from "@/lib/auth";

export type Variables = {
  container: ICradle;
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
  upload?: {
    url: string;
    filename: string;
  };
};
