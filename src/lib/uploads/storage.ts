export type UploadResult = {
  url: string;
  key: string;
};

export async function uploadFile(_file: File): Promise<UploadResult> {
  // TODO: Choose upload target first: Vercel Blob, S3, Cloudinary, etc.
  // Hint: in production, issue short-lived upload tokens from a server route.
  throw new Error("Not implemented yet. Add storage provider logic here.");
}
