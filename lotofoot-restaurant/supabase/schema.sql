-- ============================================================
-- LOTOFOOT RESTAURANT — Schéma Supabase (PostgreSQL)
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- PROFILS ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text unique not null,
  avatar_url text,
  is_admin boolean not null default false,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- COMPÉTITIONS ----------
create table public.competitions (
  id bigint generated always as identity primary key,
  name text not null,                -- ex: "Ligue 1", "Tournoi de Noël"
  api_league_id integer,             -- id API-Football (null si compétition interne)
  season integer,
  is_special boolean not null default false,
  invite_code text,                  -- ex: "RESTAU2026" pour ligue privée
  created_at timestamptz not null default now()
);

-- ---------- MATCHS ----------
create table public.matches (
  id bigint generated always as identity primary key,
  competition_id bigint references public.competitions(id) on delete set null,
  api_fixture_id integer unique,     -- id du match dans API-Football
  home_team text not null,
  away_team text not null,
  home_logo text,
  away_logo text,
  kickoff timestamptz not null,
  status text not null default 'scheduled', -- scheduled | live | halftime | finished | postponed
  home_score integer,                -- score temps réglementaire (90 min)
  away_score integer,
  created_at timestamptz not null default now()
);

create index matches_kickoff_idx on public.matches (kickoff);

-- ---------- PRONOSTICS ----------
create table public.predictions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  pred_home integer not null check (pred_home between 0 and 20),
  pred_away integer not null check (pred_away between 0 and 20),
  -- résultats calculés après le match :
  points integer,
  is_exact_score boolean,
  is_correct_result boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ============================================================
-- 🎯 SYSTÈME DE POINTS LOTO FOOT (source de vérité SQL)
--    Score exact  = 3 pts | Bon résultat = 1 pt | Mauvais = 0 pt
-- ============================================================
create or replace function public.calculate_points(
  p_pred_home int, p_pred_away int,
  p_real_home int, p_real_away int
) returns int language sql immutable as $$
  select case
    -- 🎯 Score exact → 3 points
    when p_pred_home = p_real_home and p_pred_away = p_real_away then 3
    -- ✓ Bon résultat (1/N/2) → 1 point
    when sign(p_pred_home - p_pred_away) = sign(p_real_home - p_real_away) then 1
    -- ✗ Mauvais → 0 point
    else 0
  end;
$$;

-- Applique les points à tous les pronostics d'un match terminé
create or replace function public.settle_match(p_match_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  select * into m from matches where id = p_match_id;
  if m.status <> 'finished' or m.home_score is null then
    raise exception 'Match non terminé ou score manquant';
  end if;

  update predictions p set
    points = calculate_points(p.pred_home, p.pred_away, m.home_score, m.away_score),
    is_exact_score = (p.pred_home = m.home_score and p.pred_away = m.away_score),
    is_correct_result = (sign(p.pred_home - p.pred_away) = sign(m.home_score - m.away_score)),
    updated_at = now()
  where p.match_id = p_match_id;
end; $$;

-- ---------- VERROUILLAGE 5 MIN AVANT LE COUP D'ENVOI ----------
create or replace function public.check_prediction_open()
returns trigger language plpgsql as $$
declare k timestamptz;
begin
  select kickoff into k from matches where id = new.match_id;
  if now() >= k - interval '5 minutes' then
    raise exception 'Paris clôturés : le match commence dans moins de 5 minutes.';
  end if;
  new.updated_at := now();
  return new;
end; $$;

create trigger predictions_lock
  before insert or update on public.predictions
  for each row execute function public.check_prediction_open();

-- ---------- CLASSEMENTS (vues) ----------
create or replace view public.leaderboard_season as
select
  pr.user_id,
  pf.pseudo,
  pf.avatar_url,
  coalesce(sum(pr.points), 0)::int as total_points,
  count(*) filter (where pr.is_correct_result) as correct_results,
  count(*) filter (where pr.is_exact_score) as exact_scores,
  rank() over (order by coalesce(sum(pr.points), 0) desc) as rang
from predictions pr
join profiles pf on pf.id = pr.user_id
where pr.points is not null and pf.is_suspended = false
group by pr.user_id, pf.pseudo, pf.avatar_url;

create or replace view public.leaderboard_month as
select
  pr.user_id, pf.pseudo, pf.avatar_url,
  coalesce(sum(pr.points), 0)::int as total_points,
  count(*) filter (where pr.is_exact_score) as exact_scores,
  rank() over (order by coalesce(sum(pr.points), 0) desc) as rang
from predictions pr
join profiles pf on pf.id = pr.user_id
join matches m on m.id = pr.match_id
where pr.points is not null
  and pf.is_suspended = false
  and date_trunc('month', m.kickoff) = date_trunc('month', now())
group by pr.user_id, pf.pseudo, pf.avatar_url;

create or replace view public.leaderboard_week as
select
  pr.user_id, pf.pseudo, pf.avatar_url,
  coalesce(sum(pr.points), 0)::int as total_points,
  count(*) filter (where pr.is_exact_score) as exact_scores,
  rank() over (order by coalesce(sum(pr.points), 0) desc) as rang
from predictions pr
join profiles pf on pf.id = pr.user_id
join matches m on m.id = pr.match_id
where pr.points is not null
  and pf.is_suspended = false
  and date_trunc('week', m.kickoff) = date_trunc('week', now())
group by pr.user_id, pf.pseudo, pf.avatar_url;

-- ---------- BADGES ----------
create table public.badges (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- bronze | argent | or | champion_mois | serie | roi_score_exact
  label text not null,
  awarded_at timestamptz not null default now()
);

-- ---------- CHAT ----------
create table public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz not null default now()
);

-- ============================================================
-- SÉCURITÉ (Row Level Security)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.competitions enable row level security;
alter table public.predictions enable row level security;
alter table public.badges enable row level security;
alter table public.messages enable row level security;

create policy "profils visibles par tous" on public.profiles for select using (true);
create policy "modifier son profil" on public.profiles for update using (auth.uid() = id);

create policy "matchs visibles" on public.matches for select using (true);
create policy "competitions visibles" on public.competitions for select using (true);
create policy "badges visibles" on public.badges for select using (true);

create policy "voir tous les pronostics des matchs verrouillés, et les siens"
  on public.predictions for select
  using (
    auth.uid() = user_id
    or exists (select 1 from matches m where m.id = match_id and now() >= m.kickoff - interval '5 minutes')
  );
create policy "créer son pronostic" on public.predictions for insert with check (auth.uid() = user_id);
create policy "modifier son pronostic" on public.predictions for update using (auth.uid() = user_id);

create policy "lire le chat" on public.messages for select using (true);
create policy "écrire dans le chat" on public.messages for insert with check (auth.uid() = user_id);

-- Admin : passe par le service_role (API routes côté serveur), qui contourne RLS.

-- ---------- POUR DEVENIR ADMIN ----------
-- Après votre première inscription, exécutez :
-- update public.profiles set is_admin = true where pseudo = 'VOTRE_PSEUDO';
