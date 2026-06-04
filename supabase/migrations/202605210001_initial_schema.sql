create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_url text not null,
  source_type text not null check (source_type in ('youtube', 'web')),
  source_video_id text,
  thumbnail_url text,
  servings text,
  status text not null check (status in ('importing', 'needs_review', 'saved', 'failed')),
  parse_confidence numeric,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  raw_text text not null,
  normalized_name text,
  amount_value numeric,
  amount_unit text,
  importance text not null check (importance in ('primary', 'secondary', 'seasoning')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  position int not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, position)
);

create table public.parsed_sources (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  parser_type text not null check (parser_type in ('youtube_description', 'webpage_llm')),
  raw_excerpt text,
  model_name text,
  schema_version text,
  confidence numeric,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.price_hints (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  provider text not null default 'mock',
  query text,
  matched_product_name text,
  matched_product_url text,
  unit_price numeric,
  unit text,
  price_band text not null check (price_band in ('cheap', 'normal', 'expensive', 'unknown')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  score numeric not null,
  price_hint_summary text,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  generated_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

create index recipes_user_created_idx on public.recipes(user_id, created_at desc);
create index recipes_user_title_idx on public.recipes(user_id, title);
create index ingredients_recipe_idx on public.ingredients(recipe_id);
create index recipe_steps_recipe_position_idx on public.recipe_steps(recipe_id, position);
create index parsed_sources_recipe_idx on public.parsed_sources(recipe_id);
create index price_hints_ingredient_checked_idx on public.price_hints(ingredient_id, checked_at desc);
create index recommendations_user_score_idx on public.recommendations(user_id, score desc, generated_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create trigger ingredients_set_updated_at
before update on public.ingredients
for each row execute function public.set_updated_at();

create trigger recipe_steps_set_updated_at
before update on public.recipe_steps
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.parsed_sources enable row level security;
alter table public.price_hints enable row level security;
alter table public.recommendations enable row level security;

create policy "profiles own rows"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "recipes own rows"
on public.recipes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ingredients via own recipe"
on public.ingredients
for all
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = ingredients.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recipe_steps via own recipe"
on public.recipe_steps
for all
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "parsed_sources via own recipe"
on public.parsed_sources
for all
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = parsed_sources.recipe_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.recipes
    where recipes.id = parsed_sources.recipe_id
      and recipes.user_id = auth.uid()
  )
);

create policy "price_hints via own recipe ingredient"
on public.price_hints
for all
using (
  exists (
    select 1
    from public.ingredients
    join public.recipes on recipes.id = ingredients.recipe_id
    where ingredients.id = price_hints.ingredient_id
      and recipes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ingredients
    join public.recipes on recipes.id = ingredients.recipe_id
    where ingredients.id = price_hints.ingredient_id
      and recipes.user_id = auth.uid()
  )
);

create policy "recommendations own rows"
on public.recommendations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
