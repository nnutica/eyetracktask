-- 1. Create PROFILES table (Syncs with Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create PROJECTS table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- เจ้าของ Project
  name text not null,
  icon text, -- เก็บ emoji หรือ url
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create TASKS table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null, -- ลบ Project งานหายด้วย
  title text not null,
  description text,
  status text check (status in ('TODO', 'IN_PROGRESS', 'Review', 'DONE')) default 'TODO',
  due_date timestamp with time zone,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create SUBTASKS table
create table public.sub_tasks (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks on delete cascade not null, -- ลบ Task ย่อยหายด้วย
  title text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create SCHEDULED_CALLS table
create table public.scheduled_calls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  start_time timestamp with time zone not null,
  attendees text[], -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --- SECURITY (Row Level Security) ---
-- เปิดใช้งาน RLS ทุกตาราง
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table sub_tasks enable row level security;
alter table scheduled_calls enable row level security;

-- สร้าง Policy: "ใครสร้างคนนั้นเห็น/แก้ได้" (Simple Owner Policy)
-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Projects
create policy "Users can CRUD own projects" on projects for all using (auth.uid() = user_id);

-- Tasks (ต้องเช็คว่า User เป็นเจ้าของ Project ของ Task นั้นไหม)
create policy "Users can CRUD own tasks" on tasks for all using (
  exists (select 1 from projects where id = tasks.project_id and user_id = auth.uid())
);

-- SubTasks (ต้องเช็คลึกไปถึง Project)
create policy "Users can CRUD own subtasks" on sub_tasks for all using (
  exists (
    select 1 from tasks 
    join projects on tasks.project_id = projects.id 
    where tasks.id = sub_tasks.task_id and projects.user_id = auth.uid()
  )
);

-- Scheduled Calls
create policy "Users can CRUD own calls" on scheduled_calls for all using (auth.uid() = user_id);

-- --- AUTO PROFILE CREATION TRIGGER ---
-- ฟังก์ชันสร้าง Profile อัตโนมัติเมื่อ User สมัครสมาชิกผ่าน Auth
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();