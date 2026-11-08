import { getNeonServerDatabasePool } from "@/integrations/neon/legacy-login.server";

/**
 * Public advisor directory backed by trusted Neon SQL.
 *
 * The seven legacy "public_advisors" cards are informational until an
 * authenticated, approved adviser is linked. Linking is deliberately
 * fail-closed: a linked profile must be visible, approved, carry the advisor
 * role and baseline member role, and not be an administrator. Never use
 * user-editable metadata to determine advisor eligibility.
 */
export type PublicNeonAdvisor = {
  id: string;
  linked_user_id: string | null;
  display_name: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  focus_areas: string[];
  calendly_url: string | null;
  accepting_messages: boolean;
  availability_status: "available" | "busy" | "offline";
  last_seen_at: string | null;
};

export async function listNeonApprovedPublicAdvisors(): Promise<PublicNeonAdvisor[]> {
  const { rows } = await getNeonServerDatabasePool().query<PublicNeonAdvisor>(`
    WITH approved AS (
      SELECT p.id, p.display_name, p.headline, p.bio, p.focus_areas,
             p.accepting_messages, p.availability_status, p.last_seen_at
      FROM public.profiles p
      WHERE p.is_advisor IS TRUE AND p.is_public IS TRUE
        AND EXISTS (
          SELECT 1 FROM public.user_roles r
          WHERE r.user_id=p.id AND r.role::text='teen'
        )
        AND EXISTS (
          SELECT 1 FROM public.user_roles r
          WHERE r.user_id=p.id AND r.role::text='advisor'
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.user_roles r
          WHERE r.user_id=p.id AND r.role::text='admin'
        )
        AND EXISTS (
          SELECT 1 FROM public.advisor_applications a
          WHERE a.user_id=p.id AND a.status='approved'
        )
    ),
    cards AS (
      SELECT d.id::text AS id,
        CASE WHEN COALESCE(p.accepting_messages,false) THEN p.id::text ELSE NULL END
          AS linked_user_id,
        d.display_name,
        COALESCE(NULLIF(p.headline,''),d.headline) AS headline,
        COALESCE(NULLIF(p.bio,''),d.bio) AS bio,
        d.photo_url,
        COALESCE(p.focus_areas,ARRAY[]::text[]) AS focus_areas,
        NULL::text AS calendly_url,
        COALESCE(p.accepting_messages,false) AS accepting_messages,
        CASE WHEN COALESCE(p.accepting_messages,false)
             AND p.availability_status IN ('available','busy')
             THEN p.availability_status ELSE 'offline' END AS availability_status,
        NULL::text AS last_seen_at,
        0 AS source_rank, COALESCE(d.sort_order,0) AS sort_order
      FROM public.public_advisors d
      LEFT JOIN approved p ON p.id=d.linked_user_id
      WHERE d.is_public IS TRUE
        AND (d.linked_user_id IS NULL OR p.id IS NOT NULL)
      UNION ALL
      SELECT p.id::text,
        CASE WHEN COALESCE(p.accepting_messages,false) THEN p.id::text ELSE NULL END,
        p.display_name, p.headline, p.bio,
        NULL::text,
        COALESCE(p.focus_areas,ARRAY[]::text[]),
        NULL::text,
        COALESCE(p.accepting_messages,false),
        CASE WHEN COALESCE(p.accepting_messages,false)
             AND p.availability_status IN ('available','busy')
             THEN p.availability_status ELSE 'offline' END,
        NULL::text,
        1, 0
      FROM approved p
      WHERE NOT EXISTS (
        SELECT 1 FROM public.public_advisors d WHERE d.linked_user_id=p.id
      )
    )
    SELECT id,linked_user_id,display_name,headline,bio,photo_url,
           focus_areas,calendly_url,accepting_messages,availability_status,last_seen_at
    FROM cards
    ORDER BY source_rank,sort_order,display_name
  `);
  return rows;
}
