const DEFAULT_FUSE_API =
  "https://1gp21rrv70.execute-api.us-east-1.amazonaws.com";

export function fuseApiUrl() {
  const url =
    process.env.FUSE_API_URL ||
    process.env.NEXT_PUBLIC_FUSE_API_URL ||
    DEFAULT_FUSE_API;
  return url.replace(/\/$/, "");
}
