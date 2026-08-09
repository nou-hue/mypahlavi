-- Shop orders: Stripe payment + Printify fulfilment pipeline

create table if not exists shop_orders (
  id text primary key,
  created_at timestamptz not null default CURRENT_TIMESTAMP,
  updated_at timestamptz not null default CURRENT_TIMESTAMP,
  email text not null,
  status text not null default 'pending',
  -- pending | paid | printify_submitted | fulfilled | failed | cancelled
  stripe_session_id text unique,
  stripe_payment_intent text,
  printify_order_id text,
  currency text not null default 'gbp',
  subtotal_pence integer not null default 0,
  shipping_pence integer not null default 0,
  total_pence integer not null default 0,
  shipping_json text not null default '{}',
  lines_json text not null default '[]',
  metadata_json text not null default '{}',
  error_message text
);

create index if not exists shop_orders_email_idx on shop_orders (email);
create index if not exists shop_orders_status_idx on shop_orders (status);
create index if not exists shop_orders_stripe_session_idx on shop_orders (stripe_session_id);
