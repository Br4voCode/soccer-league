export type ApiTarget = "local" | "remote";

export const getApiTarget = (): ApiTarget =>
  process.env.API_TARGET === "local" ? "local" : "remote";

export const getApiUrl = () => {
  const url =
    getApiTarget() === "local"
      ? process.env.API_URL_LOCAL
      : process.env.API_URL_REMOTE;

  return url?.replace(/\/+$/, "") || undefined;
};
