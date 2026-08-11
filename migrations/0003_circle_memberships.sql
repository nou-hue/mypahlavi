-- Circle patronage memberships (Stripe subscriptions)

create table if not exists circle_memberships (
  id text primary key,
  user_id text not null,
  email text not null,
  tier_id text not null,
  -- reader | patron | benefactor
  status text not null default 'pending',
  -- pending | active | past_due | canceled | incomplete
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_session_id text unique,
  amount_pence integer not null,
  currency text not null default 'gbp',
  current_period_end timestamptz,
  created_at timestamptz not null default CURRENT_TIMESTAMP,
  updated_at timestamptz not null default CURRENT_TIMESTAMP,
  metadata_json text not null default '{}'
);

create index if not exists circle_memberships_user_id_idx on circle_memberships (user_id);
create index if not exists circle_memberships_email_idx on circle_memberships (email);
create index if not exists circle_memberships_status_idx on circle_memberships (status);
create index if not exists circle_memberships_subscription_idx on circle_memberships (stripe_subscription_id);
