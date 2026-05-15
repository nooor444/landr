-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  nationality text default 'Indian',
  destination_country text,
  visa_type text,
  situation text,
  arrival_date date,
  created_at timestamp with time zone default now()
);

-- Checklist items
create table public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  priority integer default 0,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  official_link text,
  deadline_days integer,
  created_at timestamp with time zone default now()
);

-- Chat messages
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Community posts
create table public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text,
  title text not null,
  content text not null,
  upvotes integer default 0,
  created_at timestamp with time zone default now()
);

-- Community replies
create table public.community_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.checklist_items enable row level security;
alter table public.chat_messages enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Checklist policies
create policy "Users can view own checklist"
  on public.checklist_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own checklist items"
  on public.checklist_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checklist items"
  on public.checklist_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own checklist items"
  on public.checklist_items for delete
  using (auth.uid() = user_id);

-- Chat message policies
create policy "Users can view own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Community posts policies (everyone can read, own to write)
create policy "Anyone can view community posts"
  on public.community_posts for select
  using (true);

create policy "Users can insert own posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.community_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- Community replies policies
create policy "Anyone can view replies"
  on public.community_replies for select
  using (true);

create policy "Users can insert own replies"
  on public.community_replies for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own replies"
  on public.community_replies for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
