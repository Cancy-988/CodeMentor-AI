create table if not exists public.users (
    id bigserial primary key,
    supabase_user_id text not null unique,
    email text,
    full_name text,
    avatar_url text,
    auth_provider text not null default 'google',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.chats (
    id bigserial primary key,
    user_id bigint not null references public.users(id) on delete cascade,
    title text not null,
    summary text,
    language text,
    framework text,
    source text not null default 'chat',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.messages (
    id bigserial primary key,
    chat_id bigint not null references public.chats(id) on delete cascade,
    role text not null,
    content text not null,
    metadata_json jsonb,
    created_at timestamptz not null default now()
);

create table if not exists public.reviews (
    id bigserial primary key,
    user_id bigint not null references public.users(id) on delete cascade,
    chat_id bigint references public.chats(id) on delete set null,
    language text not null,
    code text not null,
    result_json jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists public.uploads (
    id bigserial primary key,
    user_id bigint not null references public.users(id) on delete cascade,
    chat_id bigint references public.chats(id) on delete set null,
    filename text not null,
    language text not null,
    content text not null,
    file_type text not null default 'code',
    mime_type text,
    storage_path text,
    extracted_text text,
    created_at timestamptz not null default now()
);

create table if not exists public.memories (
    id bigserial primary key,
    user_id bigint not null references public.users(id) on delete cascade,
    key text not null,
    value_json jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_memory_user_key unique (user_id, key)
);