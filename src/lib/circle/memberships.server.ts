import { getSql } from "@/lib/db";
import type { CircleTierId } from "@/data/circle";

export type CircleMembership = {
  id: string;
  user_id: string;
  email: string;
  tier_id: CircleTierId;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_session_id: string | null;
  amount_pence: number;
  currency: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

function membershipId() {
  return `CR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export async function insertMembership(input: {
  userId: string;
  email: string;
  tierId: CircleTierId;
  amountPence: number;
  stripeSessionId?: string | null;
}): Promise<CircleMembership> {
  const sql = await getSql();
  const id = membershipId();
  const rows = await sql<CircleMembership>`
    insert into circle_memberships (
      id, user_id, email, tier_id, status, amount_pence, stripe_session_id
    ) values (
      ${id},
      ${input.userId},
      ${input.email},
      ${input.tierId},
      ${"pending"},
      ${input.amountPence},
      ${input.stripeSessionId ?? null}
    )
    returning *
  `;
  return rows[0]!;
}

export async function updateMembership(
  id: string,
  patch: Partial<{
    status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    stripe_session_id: string | null;
    current_period_end: string | null;
  }>,
) {
  const sql = await getSql();
  const current = await getMembershipById(id);
  if (!current) return null;
  const next = {
    status: patch.status ?? current.status,
    stripe_customer_id:
      patch.stripe_customer_id !== undefined
        ? patch.stripe_customer_id
        : current.stripe_customer_id,
    stripe_subscription_id:
      patch.stripe_subscription_id !== undefined
        ? patch.stripe_subscription_id
        : current.stripe_subscription_id,
    stripe_session_id:
      patch.stripe_session_id !== undefined
        ? patch.stripe_session_id
        : current.stripe_session_id,
    current_period_end:
      patch.current_period_end !== undefined
        ? patch.current_period_end
        : current.current_period_end,
  };
  const rows = await sql<CircleMembership>`
    update circle_memberships set
      status = ${next.status},
      stripe_customer_id = ${next.stripe_customer_id},
      stripe_subscription_id = ${next.stripe_subscription_id},
      stripe_session_id = ${next.stripe_session_id},
      current_period_end = ${next.current_period_end},
      updated_at = CURRENT_TIMESTAMP
    where id = ${id}
    returning *
  `;
  return rows[0] ?? null;
}

export async function getMembershipById(id: string) {
  const sql = await getSql();
  const rows = await sql<CircleMembership>`
    select * from circle_memberships where id = ${id} limit 1
  `;
  return rows[0] ?? null;
}

export async function getMembershipBySession(sessionId: string) {
  const sql = await getSql();
  const rows = await sql<CircleMembership>`
    select * from circle_memberships where stripe_session_id = ${sessionId} limit 1
  `;
  return rows[0] ?? null;
}

export async function getMembershipBySubscription(subId: string) {
  const sql = await getSql();
  const rows = await sql<CircleMembership>`
    select * from circle_memberships where stripe_subscription_id = ${subId} limit 1
  `;
  return rows[0] ?? null;
}

export async function getActiveMembershipForUser(userId: string) {
  const sql = await getSql();
  const rows = await sql<CircleMembership>`
    select * from circle_memberships
    where user_id = ${userId}
      and status in ('active', 'past_due')
    order by updated_at desc
    limit 1
  `;
  return rows[0] ?? null;
}
