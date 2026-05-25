# Struktura projektu (Next.js App Router + Mantine)

Tento dokument popisuje **cílovou strukturu** projektu a konvence, aby byl kód dlouhodobě přehledný a konzistentní.

## Základní principy

- **`app/` = routy + orchestrace** (App Router).
  - `page.tsx`/`layout.tsx` držet **tenké**: skládání UI, případně serverový fetch na úrovni stránky.
  - Větší UI bloky přesouvat do `app/**/_components`.
- **Route groups**: používáme `(public)` a `(admin)` pro oddělení částí aplikace **bez změny URL**.
- **Kolokace**: komponenty specifické pro jednu routu/feature patří co nejblíž k ní (`_components`).
- **Sdílené UI**: opakovaně použitelné komponenty patří do `components/ui`.
- **Server vs Client**:
  - Serverové use-cases (DB, auth, fetch) patří do `lib/server`.
  - Client komponenty mají `'use client'` a nesmí importovat server-only logiku.

## Cílový strom složek (high-level)

```txt
app/
  layout.tsx
  favicon.ico
  theme-ff.ts

  (public)/
    layout.tsx
    page.tsx
    public.module.css
    _components/
      AboutUs.tsx
      Concerts.tsx
      Discography.tsx
      Footer.tsx
      Header.tsx
      Header.module.css
      Hero.tsx
      Lineup.tsx
      Platforms.tsx
      Sponsors.tsx

    [slug]/
      route.ts
      not-found.tsx

    error/
      page.tsx

  (admin)/
    admin/
      layout.tsx
      page.tsx
      _components/
        AdminDashboardPage.tsx
        AdminShell.tsx
        AuthLoginLink.tsx
        AuthLoginLink.module.css
        Navbar.tsx
        Navbar.module.css
        UserButton.tsx
        UserButton.module.css
      user/
        page.tsx
        _components/
          UserProfileForm.tsx

  auth/
    forgot-password/
      page.tsx
      ForgotPasswordPage.tsx
      ForgotPasswordPage.module.css
    login/
      page.tsx
      LoginPage.tsx
      LoginPage.module.css
    reset-password/
      page.tsx
      ResetPasswordPage.tsx
      ResetPasswordPage.module.css
    confirm/
      route.ts
    logout/
      route.ts

  api/
    auth/
      reset-password/
        route.ts

components/
  shared/
    ErrorPage.tsx
    ErrorPage.module.css
  ui/
    Alert.tsx
    AnimatedCounter.tsx
    ColorSchemeButton.tsx
    JumboTitle.tsx
    ... (design-system komponenty)

lib/
  server/
    getPlatforms.ts
    getRedirectUrl.ts
    getSponsors.ts
    getUser.ts
    resetUserPassword.ts
  supabase/
    client.ts
    middleware.ts
    server.ts
  utils/
    datetime.ts
    getImageUrl.ts
    utils.ts
    utilsClient.ts

supabase/
  config.toml
  templates/
    password_reset.html
```

## Konvence pro `app/` (App Router)

- **Route groups**:
  - `app/(public)` = veřejná část webu (landing, veřejné routy).
  - `app/(admin)/admin` = admin část (chráněná přes `layout.tsx` guard).
- **`_components/`**:
  - Slouží pro komponenty specifické pro daný segment (nejsou určené k reuse napříč aplikací).
  - Pomáhá to zabránit „nechtěnému“ importování feature-komponent odjinud.
- **Dynamická routa `/[slug]`**:
  - Next.js nepovolí mít v jednom segmentu zároveň `page.tsx` a `route.ts`.
  - Pro `/[slug]` používáme **jen** `route.ts` (redirector endpoint chování), případné UI pro slug by muselo být řešeno v jiné routě/struktuře.

## Konvence pro `components/`

- **`components/ui`**:
  - Sdílené UI prvky (design system): tlačítka, alerty, navigační prvky, malé UI utility.
  - Měly by být co nejvíc „obecné“ a neobsahovat business logiku konkrétní routy.
- **`components/shared`**:
  - Sdílené „app-level“ komponenty (např. error stránky), které nejsou čistě UI atomy,
    ale zároveň nejsou vázané na jednu konkrétní routu.

## Konvence pro `lib/`

- **`lib/server/*`**:
  - Serverové use-cases: DB (drizzle), server Supabase, fetchy, redirect lookup apod.
  - Smí se importovat z `page.tsx`, `layout.tsx`, `route.ts` (server kontext).
- **`lib/supabase/*`**:
  - `server.ts`: server klient (cookies/headers).
  - `client.ts`: browser klient (pro client komponenty).
  - `middleware.ts`: refresh session apod.
- **Client volání server logiky**:
  - Pokud je potřeba vyvolat serverovou akci z client komponenty, používat `app/api/*` endpoint (nebo server actions, pokud je zavedeme).
  - Příklad: forgot-password volá `POST /api/auth/reset-password`.

## Praktická pravidla pro DX (doporučení)

- **Kdy zůstat v `page.tsx`**: malé markup bloky bez logiky a bez reuse.
- **Kdy vytvořit komponentu**: jakmile roste UI, přibývá stav, validace, fetch, nebo se to bude znovu používat.
- **Importy**:
  - Route-specifické komponenty preferuj relativně: `./_components/X`.
  - Sdílené věci přes alias: `@/components/ui/...`, `@/components/shared/...`, `@/lib/server/...`.

