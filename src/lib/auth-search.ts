import { z } from "zod";

// TanStack Router parses URL search parameters as JSON: recovery=1 becomes
// numeric 1. Neon Auth reset links must also retain their opaque token.
export const authSearchSchema = z.object({
  mode: z.enum(["signup", "signin"]).optional(),
  recovery: z
    .union([z.literal("1"), z.literal(1)])
    .transform(() => "1" as const)
    .optional()
    .catch(undefined),
  token: z.string().max(4096).optional().catch(undefined),
});
