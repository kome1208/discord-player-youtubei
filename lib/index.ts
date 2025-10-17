import { Innertube, Platform, Types } from "youtubei.js";
import { objectToToken } from "./common/tokenUtils";

const exit = (message: any, clean: boolean) => {
  if (clean) {
    console.log(message);
    process.exit(0);
  }

  throw new Error(message);
};

Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
  const properties = [];

  if(env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return new Function(code)();
}

export async function generateOauthTokens() {
  const youtube = await Innertube.create({
    retrieve_player: false,
  });

  youtube.session.on("auth-pending", (data) => {
    const { verification_url: verify, user_code } = data;

    console.log(
      `Follow this URL: ${verify} and enter this code: ${user_code}\nMake sure you are using a throwaway account to login. Using your main account may result in ban or suspension`,
    );
  });

  youtube.session.on("auth-error", (err) => {
    exit(err.message, false);
  });

  youtube.session.on("auth", (data) => {
    if (!data.credentials) exit("Something went wrong", false);

    console.log("Your cookies are printed down below");
    console.log(objectToToken(data.credentials));
    exit("Done Getting the credentials", true);
  });

  await youtube.session.signIn();
}

export * from "./Extractor/Youtube";
export * from "./common/tokenUtils";
export * from "./common/getInstance";
export * from "./utils/index";
export * from "./token/tokenGenerator";
