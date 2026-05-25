# Jak funguje metadata v Next.js App Router

## Automatické zpracování

V Next.js App Router **nemusíš metadata nikde ručně používat**. Next.js automaticky:

1. **Načte export `metadata`** z `layout.tsx` a `page.tsx` souborů
2. **Vloží metadata do HTML `<head>`** při renderování stránky
3. **Zkombinuje metadata** z layoutu a stránky (metadata ze stránky přepisuje metadata z layoutu)

## Jak to funguje pod kapotou

Když Next.js renderuje stránku:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Free Fall',
  description: '...',
};

// Next.js automaticky vytvoří:
// <head>
//   <title>Free Fall</title>
//   <meta name="description" content="..." />
//   ...
// </head>
```

## Jak ověřit, že to funguje

1. **Zkontroluj HTML zdroj**:
   - Otevři stránku v prohlížeči
   - Klikni pravým tlačítkem → "Zobrazit zdroj stránky"
   - Najdi `<head>` sekci - tam uvidíš všechny meta tagy

2. **Použij DevTools**:
   - Otevři DevTools (F12)
   - V Elements/Inspekce najdi `<head>` element
   - Uvidíš všechny meta tagy, které Next.js vygeneroval

3. **Zkontroluj v terminálu**:
```bash
# Spusť dev server
npm run dev

# V jiném terminálu získej HTML
curl http://localhost:8080 | grep -A 20 "<head>"
```

## Příklady

### Základní metadata v layout.tsx
```typescript
export const metadata: Metadata = {
  title: 'Free Fall',
  description: 'Metalová kapela',
};
```

### Metadata s template pro title
```typescript
export const metadata: Metadata = {
  title: {
    default: 'Free Fall',
    template: '%s | Free Fall', // "Domů | Free Fall"
  },
};
```

### Metadata pro konkrétní stránku
```typescript
// app/page.tsx
export const metadata: Metadata = {
  title: 'Domů', // Bude "Domů | Free Fall"
  description: 'Hlavní stránka',
};
```

### Dynamická metadata (z databáze)
```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## Důležité poznámky

- ✅ **Export musí být pojmenován přesně `metadata`** (ne `pageMetadata` nebo jinak)
- ✅ **Typ musí být `Metadata`** z `next`
- ✅ **Next.js to zpracuje automaticky** - nemusíš to nikde importovat nebo používat
- ✅ **Metadata se merguje** - metadata ze stránky přepisuje metadata z layoutu
- ❌ **Nepoužívej `<head>` tag ručně** v layout.tsx - Next.js to dělá automaticky

## Co se generuje

Z tvého `metadata` objektu Next.js vytvoří:

- `<title>` tag
- `<meta name="description">`
- `<meta name="keywords">`
- `<meta property="og:title">` (Open Graph)
- `<meta name="twitter:card">` (Twitter)
- `<link rel="canonical">`
- A další podle toho, co v metadata definuješ





