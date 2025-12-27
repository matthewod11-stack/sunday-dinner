# V2 Parking Lot

Everything deferred from v1. Organized so I can pull from this when scoping v2.

---

## User & Scaling Features

Features that require multi-user infrastructure or are only valuable at scale.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **User accounts & auth** | Solo user for v1 | Supabase Auth is ready when needed |
| **Family management** | Multi-user primitive | Create family, invite members, shared recipe library |
| **Role-based permissions** | Requires user system | Admin (full control), Contributor (edit recipes/meals), Helper (view-only + assigned tasks) |
| **Helper task assignments** | Multi-user | "Sarah: salads at 5:30" — assign tasks to specific people |
| **Helper view** | Multi-user | Stripped-down view showing only their assigned tasks |
| **Real-time collaboration** | Multi-user | See others' checkoffs in real-time, presence indicators |
| **Concurrent checkoff conflict resolution** | Multi-user | Handle race condition when two people check same task |
| **Guest list management** | Multi-user | Track guests with dietary notes, headcount per restriction |
| **Revocable share links** | Low priority for solo | Links that can be disabled, with view analytics |
| **Data migration (solo → family)** | Needed for v2 launch | Convert v1 solo user's data to family account without loss |

---

## Recipe Management Enhancements

Improvements to organizing and editing recipes.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Recipe search/filtering** | Library is small in v1 | Text search, filter by tag/ingredient; needed when library grows |
| **Recipe editing** | Correction UI sufficient for v1 | Full editing of saved recipes (not just post-extraction correction) |
| **Multi-page recipe handling** | Edge case | Recipes that span 2-3 pages, scanned out of order |
| **Batch upload** | Nice-to-have | Drag-drop 10 photos, queue extraction |
| **Per-user abbreviation dictionary** | Edge case | Learn that "T" = tablespoon for this user |
| **Duplicate detection** | Nice-to-have | Flag same recipe uploaded twice or edited variants |
| **Auto image enhancement** | Polish | De-skew, contrast boost, crop for handwritten cards |
| **Recipe import/export** | Data portability | JSON/PDF export for backup, import from other apps |
| **Bulk operations** | Scale feature | "Delete 10 old meals", "Export all recipes" |

---

## Planning Enhancements

Smarter planning and meal building.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Dietary constraint management** | v1 keeps it simple | "3 vegetarians, 1 gluten-free" with per-recipe flagging |
| **AI recipe suggestions** | Nice-to-have | "What sides go with prime rib?" from Claude |
| **Conflict detection (deep)** | Complex | Resource constraints beyond oven (mixer, counter space, attention) |
| **Chemistry warnings (deep)** | Research project | Baking soda scaling, yeast behavior, pan surface area |
| **Substitution engine** | Nice-to-have | "Out of heavy cream → use milk + butter" |
| **Prep-ahead protocol** | High value | Tag steps as "doable 2 days before" → generate Saturday Prep List |
| **Calendar integration** | Nice-to-have | Export "shop Friday, brine Saturday" reminders to calendar |
| **Drag-and-drop timeline editing** | Touch is fiddly | Desktop-only, or tap-to-select + buttons on mobile |

---

## Live Execution Enhancements

Making the killer feature even better.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Push notifications** | PWA complexity | Especially iOS Safari workarounds; in-app timers work for v1 |
| **Voice commands** | Polish | "Hey Sunday, what's next?" — narrow command set |
| **Voice announcements** | Polish | TTS for "5 minutes until green beans" |
| **Dedicated kitchen display layout** | Separate design | 4-10 foot viewing, mounted tablet, landscape-only |
| **Haptic feedback** | Polish | Satisfying vibration on task completion |
| **"Pause" button** | Edge case | Pause entire timeline for unexpected interruption |
| **Smart notifications** | Complex | Only notify if not actively using app |
| **Anticipatory tips** | AI feature | "Preheat oven now for casserole in 15 min" |
| **Multi-device sync** | Multi-user | Same user on phone + tablet, state synced |

---

## Recipe Preservation

Features for capturing and preserving family cooking knowledge.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Audio memories** | v2 theme | Record family explaining techniques; Whisper transcription |
| **Recipe versioning** | v2 theme | "Original 1987" vs "Matt's 2024 tweaks" with diff view |
| **Post-meal notes** | v2 theme | "Double the garlic next time" attached to meal |
| **Cooking session logs** | v2 theme | "Made this on 12/24/2025" with photos |
| **Photo gallery** | v2 theme | Attach finished dish photos to recipes/meals |
| **"Last time we made this"** | Needs history | Surface past notes, scaling, what worked |
| **Story mode** | Polish | Prompt for "story behind this dish" with structure |
| **Searchable transcripts** | Depends on audio | Search across all family audio memories |
| **Audio enhancement** | Polish | Noise reduction for kitchen recordings |

---

## Operational Output Enhancements

Better shopping lists, exports, and artifacts.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Multiple store lists** | Nice-to-have | Costco vs grocery vs specialty |
| **Full pantry management** | Nice-to-have | Beyond staples toggle: track quantities, expiration, auto-reorder prompts |
| **Shopping trip mode** | Nice-to-have | Reorder by store layout, swipe-to-check, track skipped items |
| **PDF export** | Polish | Timeline, shopping lists, recipe cards as printable PDF |
| **Recipe quick cards** | Polish | Printer-friendly, one page per dish, large type |
| **iMessage/WhatsApp share** | Polish | Rich preview cards when sharing links |
| **Timeline export** | Nice-to-have | Share timeline as text or calendar format |

---

## Delight & Emotional Features

What makes it "insanely great" instead of just "good."

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Celebration animations** | Polish | Confetti on meal completion |
| **Milestone callouts** | Polish | "Halfway there!" during cooking |
| **Auto-generated Meal Story** | Complex | Photos + timeline + notes as shareable artifact |
| **Cooking stats dashboard** | Needs history | "23 hours cooked this year" |
| **Year in review** | Needs history | December summary of family cooking |
| **"Try something new"** | AI feature | Suggestions based on family preferences |
| **Family brain** | Complex | Learns "we always run 15 min late on desserts" |

---

## Technical Infrastructure

Backend/architecture work for scale and reliability.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Full local-first (Replicache)** | PWA basics sufficient | True offline-first with CRDT sync |
| **Supabase Realtime optimization** | Polling works for v1 | Smart subscriptions, presence, filtered channels |
| **Background job queue** | Not needed yet | Inngest/Trigger.dev for heavy AI work |
| **Cost monitoring** | Recommended early v2 | Track AI API spend per meal; prevent surprise bills |
| **Usage analytics** | Not needed yet | Understand real usage patterns |
| **Error monitoring (Sentry)** | Recommended early v2 | Catch production errors before users report them |
| **Automated testing (Playwright)** | Nice-to-have | E2E tests for critical paths |

---

## Integrations

External services and ecosystem connections.

| Feature | Why Deferred | Notes |
|---------|--------------|-------|
| **Atmosphere / music** | Out of scope | Spotify/Sonos integration for cooking playlists |
| **Smart kitchen devices** | Out of scope | Sync with smart oven, Instant Pot timers |
| **Grocery delivery** | Out of scope | Instacart/Amazon Fresh integration |
| **Calendar sync** | Nice-to-have | Google Calendar / Apple Calendar events |
| **Native iOS timers** | Nice-to-have | Use Shortcuts to set system timers |

---

## Open Questions for V2

Questions that didn't need answering for v1 but will matter at scale.

1. **Monetization model** — Subscription? One-time? Freemium with limits?
2. **Privacy/consent for recordings** — Who can hear audio memories? Sharing rules?
3. **Recipe sharing between families** — Public recipe library? Import from other users?
4. **Competitive differentiation** — What makes this better than Paprika, Plan to Eat?
5. **International support** — Metric/imperial toggle, multi-language recipes?
6. **Commercial kitchen scale** — Cap at 50 servings? Different product for caterers?
7. **Offline conflict resolution** — If two family members edit offline, who wins?
8. **Data export/portability** — Can users export all their recipes? What format?
9. **Backward compatibility** — Can v1 users upgrade to v2 without re-entering data?

---

## Prioritization Suggestions for V2

Based on feedback themes, if I were scoping v2:

**High value, lower effort:**
- Push notifications (completes Live Mode)
- Recipe versioning (simple diffing)
- Post-meal notes (just a text field)
- Recipe search/filtering (text search, basic filters)
- Recipe editing (extend correction UI)
- Error monitoring (Sentry setup)
- Cost monitoring (basic dashboard)

**High value, higher effort:**
- Multi-user / family accounts (foundational for everything else)
- Audio memories (recording + transcription + playback)
- Voice commands (narrow set is achievable)
- Prep-ahead protocol (compounds with planning)
- Data migration strategy (needed before multi-user launch)

**Lower priority:**
- Atmosphere integration
- Smart kitchen devices
- Calendar sync
- Cooking stats
- Bulk operations

---

*Last Updated: December 2025*
