delete from public.recipes duplicate
using public.recipes original
where duplicate.user_id = original.user_id
  and duplicate.source_url = original.source_url
  and duplicate.created_at > original.created_at;

create unique index recipes_user_source_url_unique_idx
on public.recipes(user_id, source_url);
