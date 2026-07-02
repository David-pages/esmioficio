-- Completes an OAuth account after the browser exchanges its PKCE code.
-- The endpoint can only assign USER/PRO. Admin remains isolated in
-- private.app_roles and cannot be granted through registration metadata.
create or replace function public.complete_oauth_profile(
  p_desired_role text default null,
  p_apply_role boolean default false,
  p_professional_data jsonb default '{}'::jsonb
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_metadata jsonb;
  v_name text;
  v_existing_role text;
  v_final_role text;
  v_trade text;
  v_state text;
  v_municipality text;
  v_description text;
  v_years integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_desired_role is not null and upper(p_desired_role) not in ('USER', 'PRO') then
    raise exception 'Invalid application role';
  end if;

  v_email := auth.jwt()->>'email';
  v_metadata := coalesce(auth.jwt()->'user_metadata', '{}'::jsonb);
  if v_email is null then raise exception 'Authenticated user email not found'; end if;

  v_name := left(coalesce(
    nullif(p_professional_data->>'name', ''),
    nullif(v_metadata->>'name', ''),
    nullif(v_metadata->>'full_name', ''),
    nullif(split_part(v_email, '@', 1), ''),
    'Usuario'
  ), 120);

  select p.role into v_existing_role
  from public.profiles p where p.id = v_uid for update;

  v_final_role := case
    when v_existing_role = 'PRO' then 'PRO'
    when p_apply_role and upper(coalesce(p_desired_role, 'USER')) = 'PRO' then 'PRO'
    else 'USER'
  end;

  insert into public.profiles(id, name, email, role)
  values(v_uid, v_name, v_email, v_final_role)
  on conflict(id) do update set
    name = case when public.profiles.name = '' then excluded.name else public.profiles.name end,
    email = coalesce(public.profiles.email, excluded.email),
    role = v_final_role,
    updated_at = now();

  if v_final_role = 'PRO' then
    v_trade := left(coalesce(nullif(p_professional_data->>'trade', ''), 'Oficio por definir'), 120);
    v_state := left(coalesce(p_professional_data->>'state', ''), 120);
    v_municipality := left(coalesce(p_professional_data->>'municipality', ''), 120);
    v_description := left(coalesce(nullif(p_professional_data->>'description', ''), 'Completa tu perfil profesional.'), 2000);
    begin
      v_years := greatest(least(coalesce(nullif(p_professional_data->>'yearsExperience', '')::integer, 0), 80), 0);
    exception when invalid_text_representation then
      v_years := 0;
    end;

    insert into public.professionals(
      id, name, trade, location, municipality, state, email, description,
      years_experience, coverage_zones, services, last_sensitive_update, last_active_at
    ) values (
      v_uid, v_name, v_trade, v_municipality, v_municipality, v_state, v_email,
      v_description, v_years,
      case when v_municipality = '' then '{}'::text[] else array[v_municipality] end,
      case when v_trade = 'Oficio por definir' then '{}'::text[] else array[v_trade] end,
      now(), now()
    )
    on conflict(id) do update set
      name = case when public.professionals.name = '' then excluded.name else public.professionals.name end,
      email = coalesce(public.professionals.email, excluded.email),
      trade = case when public.professionals.trade = 'Oficio por definir' then excluded.trade else public.professionals.trade end,
      location = case when public.professionals.location = '' then excluded.location else public.professionals.location end,
      municipality = case when public.professionals.municipality = '' then excluded.municipality else public.professionals.municipality end,
      state = case when public.professionals.state = '' then excluded.state else public.professionals.state end,
      description = case when public.professionals.description in ('', 'Completa tu perfil profesional.') then excluded.description else public.professionals.description end,
      years_experience = greatest(public.professionals.years_experience, excluded.years_experience),
      coverage_zones = case when cardinality(public.professionals.coverage_zones) = 0 then excluded.coverage_zones else public.professionals.coverage_zones end,
      services = case when cardinality(public.professionals.services) = 0 then excluded.services else public.professionals.services end,
      last_active_at = now(),
      updated_at = now();
  end if;

  return v_final_role;
end;
$$;

revoke all on function public.complete_oauth_profile(text, boolean, jsonb) from public, anon;
grant execute on function public.complete_oauth_profile(text, boolean, jsonb) to authenticated;
