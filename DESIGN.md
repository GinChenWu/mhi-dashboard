---
version: alpha
name: 聽見光譜
description: The Spectrum of Being Heard. A warm, paper-like interactive page about how we speak and how we are heard.
colors:
  paper: "#FAF3E7"
  paper-raised: "#FFFBF4"
  paper-tint: "#F3E6D0"
  ink: "#2B2019"
  text-strong: "#261D15"
  text: "#33291F"
  text-secondary: "#605141"
  text-muted: "#726150"
  hairline: "#D9C8AD"
  task: "#3B8C8C"
  meet: "#E8973A"
  feeling: "#D9596A"
  accent-text: "#945418"
  task-text: "#2F6D71"
  feeling-text: "#AC3E4B"
  on-ink: "#F7ECDD"
typography:
  display:
    fontFamily: LXGW WenKai TC
    fontSize: 3.75rem
    fontWeight: 600
    letterSpacing: 0.14em
  heading:
    fontFamily: LXGW WenKai TC
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.25
  latin:
    fontFamily: Cormorant Garamond
    fontSize: 1.5rem
    fontWeight: 400
  body:
    fontFamily: Noto Serif TC
    fontSize: 0.9375rem
    lineHeight: 2
  ui:
    fontFamily: system-ui
    fontSize: 0.875rem
    fontWeight: 600
rounded:
  control: 9999px
  card: 1.75rem
  frame: 2.25rem
spacing:
  gutter: 16px
  section: 96px
  section-wide: 144px
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
  button-primary-on-ink:
    backgroundColor: "{colors.on-ink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  card:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
---

## Overview

聽見光譜 is a quiet, literary page about everyday misunderstandings between people who care about each other. It should feel like a hand-bound booklet read under a warm lamp: paper, ink, brushed Chinese lettering, and one thread of colour that runs from teal through amber to rose. That thread is the spectrum itself and is the only place saturated colour appears.

The page never scores or judges. Copy is spoken, plain Taiwanese Mandarin; it names things the way a friend would.

## Colors

- **Paper (#FAF3E7), raised paper (#FFFBF4), tinted paper (#F3E6D0):** the three light surfaces. Tinted paper marks a section that asks the reader to try something.
- **Ink (#2B2019):** primary buttons and the closing band. Nothing else is this dark.
- **Text (#33291F), secondary (#605141), muted (#726150):** generated with Adobe Leonardo so that even the muted tone keeps 4.8:1 on tinted paper. Regenerate with `node scripts/palette.mjs`; do not hand-pick new text colours.
- **Task (#3B8C8C), meet (#E8973A), feeling (#D9596A):** the two ends of the spectrum and the place they meet. Use them for the spectrum band, the two figures and position markers. Their text variants (#2F6D71, #945418, #AC3E4B) are for small labels only.

## Typography

- **LXGW WenKai TC** for every Chinese heading and for quoted speech. Its brush character is the voice of the page.
- **Cormorant Garamond italic** for English. English is a second title that sits directly under a Chinese heading, never a tracked-out label above it and never all caps.
- **Noto Serif TC** for running text on the home page, with generous line height.
- **System sans** for buttons, navigation and small interface text.

## Layout

The hero is centred like a poster. Everything after it is left-aligned in a 64rem column. Sections alternate paper, tinted paper and, at the very end, ink; wave edges join them. A large faint Chinese character sits behind each section heading.

## Elevation & Depth

Only three things cast a strong shadow: the framed hero painting and the two product previews. Other surfaces rely on hairlines and tint. Avoid giving every block the same rounded card and shadow.

## Motion

One orchestrated moment: on load the hero painting, title, text and buttons arrive in sequence, and the threads in the painting sway slowly. The two-row marquee drifts. Everything else moves only in response to the reader. Honour `prefers-reduced-motion`.

## Components

- **Buttons:** ink pill for the main action, hairline pill for the alternative. No arrow glyphs.
- **Accordion and tabs:** shadcn/ui components in `src/components/ui`, themed with the tokens above.
- **Marquee, load sequence, counting number:** Magic UI components in `src/components/magicui`.
- **Spectrum ribbon:** five markers on a teal-to-rose band; the centre is where both ends meet.

## Do's and Don'ts

- Do keep English short, lower in the hierarchy than the Chinese it accompanies.
- Do write copy as speech; quote what people actually say.
- Don't assign a gender to a position on the spectrum.
- Don't add scores, badges or rankings to the home page or the conversation.
- Don't introduce new accent colours, all-caps labels, or middle-dot separators.
