import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { attachNeonAuth } from "@/integrations/neon/auth-attacher";

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  functionMiddleware: [import.meta.env.VITE_BRAVER_AUTH_PROVIDER === "neon"
    ? attachNeonAuth : attachSupabaseAuth],
}));
