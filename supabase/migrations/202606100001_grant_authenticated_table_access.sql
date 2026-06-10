grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.recipes to authenticated;
grant select, insert, update, delete on table public.ingredients to authenticated;
grant select, insert, update, delete on table public.recipe_steps to authenticated;
grant select, insert, update, delete on table public.parsed_sources to authenticated;
grant select, insert, update, delete on table public.price_hints to authenticated;
grant select, insert, update, delete on table public.recommendations to authenticated;
