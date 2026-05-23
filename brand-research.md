# Portfolio Brand Research

## Working Direction

The strongest path is an editorial product archive: a portfolio that opens like a design publication, then lets each project unfold like a premium product story.

The brand should feel:

- Editorial, not template-driven
- Warm and human, not sterile tech
- Cinematic in motion, but useful first
- Pacific-influenced without falling into beach or postcard cliches
- Built around strong type, tactile surfaces, and sharp project organization

## Research Signals

Current design research points toward a few useful ideas for this portfolio:

- Adobe's 2026 design trend notes call out immersive high-energy color, organic imperfection, freeform editorial layouts, local cultural flavor, and collage/layering.
- Canva's 2026 trend report points to simple editorial layouts, clean serif fonts, tactile surfaces, cinematic storytelling, and a move away from over-polished digital sameness.
- Creative Bloq's 2026 trend coverage reinforces warmth, tactile expression, emotional color, motion-driven systems, and a reaction against generic AI-polished visuals.
- Fontfabric's typography trend coverage notes that typography is becoming the hero image and that flexible identity systems work better than rigid brand manuals.
- Awwwards' typography collection confirms that strong type-led web design remains a central pattern for high-end portfolio and editorial sites.

Source links:

- https://www.adobe.com/express/learn/blog/design-trends-2026
- https://www.canva.com/newsroom/news/design-trends-2026/
- https://www.creativebloq.com/design/graphic-design/texture-warmth-and-tactile-rebellion-the-big-graphic-design-trends-for-2026
- https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/
- https://www.awwwards.com/awwwards/collections/typography-in-web-design/

## Brand Concept

### Editorial Product Archive

A hybrid between a design magazine archive and Apple-style project storytelling.

The archive side:

- Dense project browsing
- Filters by discipline, year, role, medium, and client type
- Strong typographic hierarchy
- Fast scanning
- Project cards that feel like magazine contents, not generic tiles

The product-story side:

- Full-bleed visual chapters
- Sticky art direction moments
- Short, confident copy
- Scroll-linked transitions
- Project pages with their own pacing and mood

## Brand Personality

- Precise
- Curious
- Grounded
- Editorial
- Observant
- Kinetic
- Tactile

Avoid:

- Generic tropical branding
- Overly soft beige minimalism
- Pure dark-mode tech portfolio language
- Decorative motion that hides the work
- Overly cute illustration or mascot language

## Recommended Typography System

### Option A: Recommended

Use this for the first build.

- Display: Instrument Serif
- Text/UI: Geist
- Metadata: IBM Plex Mono

Why it works:

- Instrument Serif gives the site an editorial, fashion/catalog energy.
- Geist keeps the interface clean and contemporary.
- IBM Plex Mono gives project metadata, filters, captions, and specs a useful archive feel.
- All are affordable/open web font choices.

Use cases:

- Hero names and section titles: Instrument Serif
- Navigation, archive filters, body text: Geist
- Project year, role, medium, tags: IBM Plex Mono

### Option B: More Literary

- Display/Text Serif: Newsreader
- UI/Text Sans: IBM Plex Sans
- Metadata: IBM Plex Mono

Why it works:

- More serious and publication-like.
- Better if the site has longer writing and reflective case studies.
- Slightly less visually sharp than Option A.

### Option C: More Contemporary

- Display: Fraunces
- UI/Text: Space Grotesk
- Metadata: IBM Plex Mono

Why it works:

- More playful and graphic.
- Stronger personality, but easier to over-style.
- Good if the work is bold, expressive, and campaign-heavy.

## Recommended Color Direction

### Palette A: Recommended - Pacific Editorial

This should be the base system.

- Paper: `#F4F1EA`
- Ink: `#111315`
- Mist: `#D8DDD8`
- Rain Blue: `#6F8795`
- Deep Evergreen: `#17352F`
- Signal Coral: `#F26D5B`
- Warm Gold: `#C99A3E`

Why it works:

- Paper and ink keep the archive readable.
- Mist and rain blue connect to Seattle without going full slate-blue tech.
- Evergreen adds depth.
- Coral and gold bring warmth from Hawaii without becoming tropical.

### Palette B: High Contrast Gallery

- Gallery White: `#FAFAF7`
- Carbon: `#0A0A0A`
- Concrete: `#B8B8B1`
- Electric Blue: `#265CFF`
- Acid Green: `#B7F43D`
- Soft Red: `#E64B3C`

Why it works:

- Stronger contemporary gallery feel.
- Better for bold, digital, motion, and brand identity work.
- Risk: can feel less personal.

### Palette C: Rain Archive

- Fog: `#ECEBE4`
- Charcoal: `#1A1B1D`
- Wet Stone: `#68716E`
- Ferry Blue: `#2F5D73`
- Moss: `#596E4D`
- Ember: `#D85B3F`

Why it works:

- More grounded and Northwest.
- Good for a subtle, mature identity.
- Risk: less memorable unless typography and motion carry the brand.

## Recommended Visual Language

Use a mostly restrained system with a few memorable custom devices:

- Large editorial type moments
- Small monospaced labels for project metadata
- Wide image crops and detail crops
- Tactile paper/noise texture at very low opacity
- Scroll-linked image scale, clipping, and parallax
- Occasional map/grid linework as a transition motif
- A small "archive index" language: project numbers, years, roles, location notes

## Motion Principles

Motion should feel premium, not showy.

- Use scroll-linked animation for major project chapters.
- Use quick hover states and subtle type movement in the archive.
- Avoid hijacking scroll.
- Respect reduced-motion settings.
- Keep mobile motion simpler.

Good motion patterns:

- Sticky project hero while chapter text changes
- Image mask reveals on scroll
- Project index that shifts from list to visual preview
- Parallax only on large visual elements
- Typography that fades/slides in with clear rhythm

## Page-Level Brand Rules

### Home

The home page should introduce the brand through type and selected work, not a long explanation.

Recommended structure:

1. Oversized name or wordmark
2. One-line positioning statement
3. Featured project sequence
4. Archive preview
5. Short bio/contact band

### Archive

The archive should be the most useful page on the site.

Recommended controls:

- View toggle: Grid / Index
- Filters: Discipline, Year, Medium
- Sort: Featured / Recent / Alphabetical
- Search by project/client/tag

### Project Pages

Each project should feel like a product page with editorial pacing.

Recommended structure:

1. Full-bleed hero
2. Project facts
3. Brief
4. Strategy/concept
5. Design system or process
6. Final work
7. Outcome/reflection
8. Related projects

### About

The about page should connect Hawaii to Seattle as a story about perspective, not as decorative geography.

Possible positioning:

"A graphic designer building clear visual systems from a Pacific point of view, now relocating from Hawaii to Seattle."

## Build Recommendation

Start with:

- Astro
- MDX project files
- Content collections
- GSAP ScrollTrigger
- Cloudflare Pages
- Self-hosted fonts through Fontsource or local font files

Initial content model:

- Project title
- Slug
- Year
- Discipline
- Medium
- Role
- Client/type
- Featured flag
- Cover image
- Color accent
- Summary
- Case study body

## Decision For First Prototype

Use:

- Brand concept: Editorial Product Archive
- Type: Instrument Serif + Geist + IBM Plex Mono
- Palette: Pacific Editorial
- Motion: restrained Apple-like scroll chapters

The first prototype should include:

- Home
- Work archive
- One sample project page
- About page
- Shared design tokens
- Responsive layout system
