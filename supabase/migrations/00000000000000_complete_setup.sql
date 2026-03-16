-- ============================================
-- MoveHQ: Complete Database Setup
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================

-- 1. Rooms
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

-- 2. Boxes
create table if not exists boxes (
  id uuid primary key default gen_random_uuid(),
  box_number serial,
  label text default '',
  destination_room_id uuid references rooms(id) on delete set null,
  status text not null default 'packed',
  is_fragile boolean not null default false,
  is_priority boolean not null default false,
  handling_notes text default '',
  ai_summary text default '',
  manual_contents text default '',
  box_size text,
  photo_urls jsonb default '[]'::jsonb,
  created_by uuid,
  household_id text not null default 'default',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Essentials
create table if not exists essentials (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  is_packed boolean not null default false,
  linked_box_id uuid references boxes(id) on delete set null,
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

-- 4. Room estimates
create table if not exists room_estimates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  estimated_boxes integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Room tasks
create table if not exists room_tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  task_text text not null,
  is_done boolean not null default false,
  phase text not null default 'before_move',
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

-- 6. Activity log
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  box_id uuid references boxes(id) on delete cascade,
  action text not null,
  details jsonb default '{}'::jsonb,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

-- 7. Landlord questions
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

-- 8. Move checklist
create table if not exists move_checklist (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  category text not null default 'general',
  is_done boolean not null default false,
  sort_order integer not null default 0,
  household_id text not null default 'default',
  created_at timestamptz default now()
);

-- 9. Furniture inventory
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

-- ============================================
-- Row Level Security (allow all for now)
-- ============================================
alter table rooms enable row level security;
alter table boxes enable row level security;
alter table essentials enable row level security;
alter table room_estimates enable row level security;
alter table room_tasks enable row level security;
alter table activity_log enable row level security;
alter table landlord_questions enable row level security;
alter table move_checklist enable row level security;
alter table furniture enable row level security;

-- Allow public access (anon key) — safe for a personal app
create policy "Allow all" on rooms for all using (true) with check (true);
create policy "Allow all" on boxes for all using (true) with check (true);
create policy "Allow all" on essentials for all using (true) with check (true);
create policy "Allow all" on room_estimates for all using (true) with check (true);
create policy "Allow all" on room_tasks for all using (true) with check (true);
create policy "Allow all" on activity_log for all using (true) with check (true);
create policy "Allow all" on landlord_questions for all using (true) with check (true);
create policy "Allow all" on move_checklist for all using (true) with check (true);
create policy "Allow all" on furniture for all using (true) with check (true);

-- ============================================
-- Enable Realtime
-- ============================================
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table boxes;
alter publication supabase_realtime add table essentials;
alter publication supabase_realtime add table room_tasks;
alter publication supabase_realtime add table landlord_questions;
alter publication supabase_realtime add table move_checklist;
alter publication supabase_realtime add table furniture;
