# ⚽ LotoFoot Restaurant

Concours de pronostics football entre collègues, inspiré du Loto Foot historique.
Mobile first · Noir / Blanc / Rouge foncé · Next.js + Supabase · Gratuit sur Vercel.

## 🎯 Système de points (Loto Foot)

| Pronostic | Points |
|---|---|
| 🎯 **Score exact** (ex : France 2-1 Sénégal, résultat 2-1) | **3 pts** |
| ✓ **Bon résultat** 1/N/2 (ex : France gagne, mais 3-0) | **1 pt** |
| ✗ **Mauvais** | **0 pt** |

Le score retenu est celui du **temps réglementaire** (90 min + arrêts de jeu, sans prolongations).
Les paris sont **verrouillés 5 minutes avant le coup d'envoi** (côté interface ET côté base de données).

Le barème est défini à deux endroits, toujours identiques :
- `lib/scoring.ts` (application)
- fonction SQL `calculate_points` dans `supabase/schema.sql` (base de données — c'est elle qui fait foi)

## ✨ Fonctionnalités

- Connexion email / mot de passe (Supabase Auth), pseudo affiché au classement
- Grille 1 / N / 2 + score exact, compte à rebours « Paris clôturés dans 04:53 »
- Import automatique des matchs (Ligue 1, Ligue 2, Premier League, Liga, Bundesliga, LdC, Europa League, Coupe du Monde, Euro) via API-Football
- Mise à jour des scores et attribution des points **toutes les 5 minutes** (cron Vercel)
- Classements **semaine / mois / saison**
- Espace admin : stats, import manuel, suspension de comptes
- PWA installable sur iPhone / Android / PC
- Sécurité : Row Level Security — les pronostics des autres ne sont visibles qu'après verrouillage du match

## 📦 1. Publier sur GitHub

```bash
cd lotofoot-restaurant
git init
git add .
git commit -m "🎉 LotoFoot Restaurant — première version"
```

Puis créez un dépôt sur https://github.com/new (par ex. `lotofoot-restaurant`, privé ou public), et :

```bash
git remote add origin https://github.com/VOTRE_PSEUDO/lotofoot-restaurant.git
git branch -M main
git push -u origin main
```

> ⚠️ Le fichier `.gitignore` exclut déjà `.env` : vos clés secrètes ne partiront jamais sur GitHub.

## 🗄️ 2. Créer le projet Supabase (gratuit)

1. https://supabase.com → **New project**
2. Dashboard → **SQL Editor** → collez tout le contenu de `supabase/schema.sql` → **Run**
3. Dashboard → **Settings → API** : notez `Project URL`, `anon key`, `service_role key`

## ⚽ 3. Clé API-Football (gratuit, 100 requêtes/jour)

1. https://www.api-football.com → créez un compte
2. Copiez votre clé API

## 🚀 4. Déployer sur Vercel (gratuit)

1. https://vercel.com → **Add New → Project** → importez votre dépôt GitHub
2. Dans **Environment Variables**, ajoutez (voir `.env.example`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_FOOTBALL_KEY`
   - `CRON_SECRET` (une chaîne aléatoire de votre choix)
   - `NEXT_PUBLIC_SITE_URL` (l'URL Vercel de votre app, ex : `https://lotofoot-restaurant.vercel.app`)
3. **Deploy** 🎉 Les crons (`vercel.json`) tournent automatiquement toutes les 5 minutes.

## 👑 5. Devenir administrateur

Après votre première inscription dans l'app, dans le SQL Editor de Supabase :

```sql
update public.profiles set is_admin = true where pseudo = 'VOTRE_PSEUDO';
```

L'onglet **Admin** de l'app devient alors actif : vous pouvez importer les matchs immédiatement.

## 💻 Développement local

```bash
npm install
cp .env.example .env.local   # puis remplissez vos clés
npm run dev                  # http://localhost:3000
```

## 🗺️ Pistes d'évolution (déjà prévues dans le schéma)

- Badges (table `badges`) : 🥉🥈🥇 🏆 Champion du mois · 🔥 Série · 🎯 Roi du score exact
- Chat d'équipe (table `messages`, brancher Supabase Realtime)
- Compétitions spéciales / ligues privées avec code (table `competitions`, champ `invite_code`)
- Notifications push (Web Push), export Excel, pronostic IA, classement ELO

## 🛠️ Stack

Next.js 14 (App Router) · React 18 · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · API-Football · Vercel Cron
