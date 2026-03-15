-- Landlord questions
create table if not exists landlord_questions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null default 'general',
  is_answered boolean not null default false,
  answer text default '',
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

alter table landlord_questions enable row level security;

-- Move checklist
create table if not exists move_checklist (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null default 'general',
  is_done boolean not null default false,
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

alter table move_checklist enable row level security;

-- Furniture inventory
create table if not exists furniture (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_id uuid references rooms(id) on delete set null,
  size text not null default 'medium',
  needs_disassembly boolean not null default false,
  notes text default '',
  household_id text not null default 'default',
  created_at timestamptz default now()
);

alter table furniture enable row level security;

-- Enable realtime for new tables
alter publication supabase_realtime add table landlord_questions;
alter publication supabase_realtime add table move_checklist;
alter publication supabase_realtime add table furniture;
