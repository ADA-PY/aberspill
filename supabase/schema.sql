-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Tables
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 3 and 500),
  tag text not null check (tag in ('confession','missed','meme','rant')),
  score int not null default 0,
  replies_count int not null default 0,
  boosted_until timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists idx_posts_created on posts(created_at desc);
create index if not exists idx_posts_boosted on posts((coalesce(boosted_until, to_timestamp(0))) desc);
create index if not exists idx_posts_tag on posts(tag);
create index if not exists idx_posts_iphash on posts(ip_hash);

create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists idx_replies_post on replies(post_id);
create index if not exists idx_replies_created on replies(created_at desc);

create table if not exists votes (
  post_id uuid references posts(id) on delete cascade,
  voter_hash text,
  value int check (value in (-1,1)),
  created_at timestamptz default now(),
  primary key (post_id, voter_hash)
);
create index if not exists idx_votes_post on votes(post_id);
create index if not exists idx_votes_voter on votes(voter_hash);

-- Helper view for Top 24h
create or replace view top24 as
  select p.* from posts p
  where p.created_at >= now() - interval '24 hours'
  order by p.score desc, p.created_at desc;

-- RLS
alter table posts enable row level security;
alter table replies enable row level security;
alter table votes enable row level security;

create policy if not exists "read_all_posts" on posts for select using (true);
create policy if not exists "read_all_replies" on replies for select using (true);
create policy if not exists "read_all_votes" on votes for select using (true);

-- Allow anonymous inserts (MVP); lock down updates (safer)
create policy if not exists "insert_posts" on posts for insert with check (true);
drop policy if exists "update_posts_public" on posts;
create policy if not exists "update_posts_none" on posts for update using (false);

create policy if not exists "insert_replies" on replies for insert with check (true);
create policy if not exists "insert_votes" on votes for insert with check (true);
create policy if not exists "update_votes" on votes for update using (true) with check (true);

-- Optional: keep replies_count in sync
create or replace function trg_replies_count() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set replies_count = replies_count + 1 where id = NEW.post_id;
  elsif tg_op = 'DELETE' then
    update posts set replies_count = greatest(replies_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists replies_count_inc on replies;
create trigger replies_count_inc after insert on replies for each row execute procedure trg_replies_count();

drop trigger if exists replies_count_dec on replies;
create trigger replies_count_dec after delete on replies for each row execute procedure trg_replies_count();

-- In Supabase > Database > Replication, add posts,replies for realtime
