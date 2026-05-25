<div align="center">

<a href="https://free-fall.cz/" targer="_BLANK">
  <img style="width: 80%;" src="https://ynoxtkknyjonqzfxdamv.supabase.co/storage/v1/object/public/logo/ff_napis_cerny_pruhledny.png">
</a>

**Next.js monorepo s Supabase backendem**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white)](https://mantine.dev/)

</div>

---

## 📋 Obsah

- [O projektu](#🎯-o-projektu)
- [Tech stack](#🛠-tech-stack)
- [Požadavky](#📦-požadavky)
- [Instalace](#🚀-instalace)
- [Vývoj](#💻-vývoj)
- [Databáze](#🗄-databáze)
- [Další příkazy](#🎛-další-příkazy)
- [Storage (obrázky)](#🖼-storage-obrázky)
- [Struktura projektu](#📁-struktura-projektu)

---

## 🎯 O projektu

FREE FALL je metalová kapela z Uherského Hradiště. Toto repo je projekt kapelní moderní webové aplikace postavené na Next.js s Supabase jako backendem. Projekt využívá TypeScript, Mantine UI a Drizzle ORM pro type-safe práci s databází. Pracovní produkční web je dostupný zde: [https://free-fall-web.vercel.app/](https://free-fall-web.vercel.app/). Stávající kapelní web, který bude nahrazen tímto projektem, je zde: [http://free-fall.cz/](http://free-fall.cz/).

---

## 🛠 Tech stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **UI knihovna**: [Mantine](https://mantine.dev/)
- **Package manager**: [pnpm](https://pnpm.io/)
- **Container**: Docker (lokální Supabase)

---

## 📦 Požadavky

Před začátkem se ujistěte, že máte nainstalované:

### Systémové požadavky

- **OS**: Linux (Ubuntu doporučeno) nebo Windows s [WSL2](https://learn.microsoft.com/cs-cz/windows/wsl/install)
- **Docker**: [Docker Desktop](https://docs.docker.com/desktop/) s povolenou WSL integrací

### Nainstalované nástroje

```bash
sudo apt update
sudo apt install -y nodejs make git gh jq
```

> **Poznámka**: Pro Windows s WSL nezapomeňte v nastavení Docker Desktop povolit integraci WSL.

---

## 🚀 Instalace

### 1. Klonování repozitáře

```bash
gh
git clone https://github.com/marek-sikora-cze/free-fall-web.git
cd free-fall-web
```

> **Poznámka**: Nastavte si terminálový git přístup k vašemu GitHub účtu před klonováním.

### 2. Nastavení projektu

Projekt obsahuje automatický setup, který:

- Nainstaluje všechny závislosti
- Spustí lokální Supabase instance
- Automaticky nastaví environment proměnné
- Vytvoří DEV uživatele `dev@free-fall.cz/dev123456789`v databázi

```bash
make setup
```

## 💻 Vývoj

### Spuštění dev serveru

Spustí Next.js dev server na portu `8080` spolu s lokálním Supabase backendem:

```bash
make dev
```

Aplikace poběží na: [http://localhost:8080](http://localhost:8080)

### Zastavení backendu na pozadí (v případě potřeby)

```bash
make stop
```

---

## 🗄 Databáze

### Aktualizace schématu

Po změnách v databázovém schématu:

```bash
make db/update
```

Tento příkaz automaticky:

1. Vygeneruje nové migrace (`make db/generate`)
2. Aplikuje migrace do databáze (`make db/migrate`)

### Database Studio

Pro vizuální správu databáze můžete použít:

#### Supabase Studio

```bash
make studio/supabase
```

→ [http://127.0.0.1:64323](http://127.0.0.1:64323)

#### Drizzle Studio

```bash
make studio/drizzle
```

→ [https://local.drizzle.studio/](https://local.drizzle.studio/)

Nebo spusťte oba najednou:

```bash
make studio
```

## 🖼 Storage (obrázky)

Obrázky a statický obsah (loga, ikony, covery alb, fotky členů apod.) jsou verzovány v gitu a automaticky synchronizovány do lokálního Supabase Storage.

### Jak to funguje

- **Git je source of truth** — soubory v `supabase/storage/` definují obsah lokálního storage
- Při každém `make dev` se automaticky spustí `storage/sync`, který dorovná local storage na stav repa (nahraje nové, smaže staré)
- Buckety jsou definovány v `supabase/config.toml` pod `[storage.buckets.<nazev>]`

### Přidání nového obrázku

1. Vlož soubor do `supabase/storage/<bucket>/nazev.png`
2. Commit + push
3. Ostatní devs dostanou obrázek automaticky při příštím `make dev`

### Smazání obrázku

1. Smaž soubor z `supabase/storage/<bucket>/`
2. Commit + push
3. Sync ho odstraní i z local storage ostatních devů

### Přidání nového bucketu

1. Vytvoř složku `supabase/storage/<novy_bucket>/` a vlož do ní soubory
2. Přidej definici do `supabase/config.toml`:
   ```toml
   [storage.buckets.novy_bucket]
   public = true
   file_size_limit = "50MiB"
   allowed_mime_types = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
   objects_path = "./storage/novy_bucket"
   ```
3. Commit + push

### Export ze Supabase do repa

Pokud máš obrázky v lokálním Supabase Storage a chceš je přenést do gitu:

```bash
make storage/export
```

Stáhne všechny soubory ze všech bucketů do `supabase/storage/` a vypíše, které buckety chybí v `config.toml`.

### Pravidla

- **Nepřidávej soubory přímo v Supabase Studio** — při příštím syncu se smažou
- **Nevkládej `.gitkeep`** do bucket složek s omezenými MIME typy — způsobí chybu při `db reset`
- Podporované formáty: PNG, JPEG, WebP, SVG (konfigurovatelné v `config.toml`)

---

## 🎛 Další příkazy

| Příkaz                | Popis                                          |
| --------------------- | ---------------------------------------------- |
| `make tsc`            | Kompilace Typescriptu                          |
| `make db/diff`        | Zobrazí rozdíly v databázovém schématu         |
| `make db/reset`       | Resetuje databázi do původního stavu           |
| `make db/push`        | Pushne změny do databáze (Supabase)            |
| `make db/pull`        | Stáhne aktuální schéma z databáze              |
| `make storage/sync`   | Synchronizuje storage z repa do local Supabase |
| `make storage/export` | Exportuje local storage do repa                |
| `make status`         | Zobrazí status Supabase služeb                 |

## 📁 Struktura projektu

```
free-fall-web/
├── app/              # Next.js App Router
├── components/       # React komponenty
├── db/               # Drizzle ORM migrace a schéma
├── lib/              # Utility funkce a konfigurace
├── supabase/         # Supabase konfigurace + storage seed data
├── Makefile          # Make příkazy pro vývoj
└── package.json      # Projektové závislosti
```

---

## 📝 Poznámky

- Veškeré environment proměnné jsou automaticky nastaveny při `make setup`
- Lokální Supabase běží v Docker kontejnerech
- Pro produkční deployment použijte `make db/migrate/prod`

---

<div align="center">

**Vytvořeno s ❤️ pro FREE FALL**

</div>
