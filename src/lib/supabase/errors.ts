type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

export function isMissingRelationError(error: SupabaseErrorLike, relationName: string) {
  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (message.includes(relationName.toLowerCase()) &&
      (message.includes("schema cache") || message.includes("does not exist")))
  );
}
