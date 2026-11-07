# Announcements: mobile handoff

The admin manages shared announcements at `/announcements`. Mobile integration belongs in a separate PR owned by Jecho. No mobile source files, production records, or push notifications are changed by this feature.

## Deployment and initial state

Deploy the additive Convex schema and functions before releasing the admin frontend. Regenerate Convex bindings when integrating the mobile branch. No seed data is provided: a new deployment starts with zero announcements. Do not publish placeholder content.

Staff (active admins and content managers) can save drafts, preview, publish, unpublish, archive drafts, and restore archived content by editing and saving it as a draft. Published records must be unpublished before editing. Unpublishing immediately removes content from the reader queries. Saving a draft never publishes or sends a notification.

Staff can permanently delete a draft, published, or archived announcement after confirming its title and the irreversible action. Deleting published content immediately removes it from reader queries; detail queries return `null`. Archive remains the reversible alternative. The staff-only `api.announcements.remove({ id, expectedUpdatedAt })` mutation rejects stale confirmations, unauthorized users, and already-deleted records.

Titles are plain text (1–120 trimmed characters); messages are plain text (1–5,000 trimmed characters). Preserve line breaks and render as text, not HTML. All mutations enforce authorization and check `expectedUpdatedAt` to reject stale edits and stale publish previews. Reopen an editor/preview after a conflict.

## Reader API

Both queries require an authenticated, active user. They omit staff IDs and draft metadata.

Home latest announcement:

```tsx
const result = useQuery(api.announcements.listPublished, {
  paginationOpts: { numItems: 1, cursor: null },
});
const latest = result?.page[0];
```

View all:

```tsx
const { results, status, loadMore } = usePaginatedQuery(
  api.announcements.listPublished,
  {},
  { initialNumItems: 10 },
);
```

The paginated response includes `page`, `continueCursor`, and `isDone` (plus standard Convex pagination metadata). Entries are sorted by `publishedAt` descending. Republishing assigns a new publication time. Each entry has this shape (illustrative only, never seeded):

```ts
{
  _id: Id<"announcements">,
  title: string,
  body: string,
  publishedAt: number // Unix milliseconds
}
```

Detail: `api.announcements.getPublished({ id })` returns the same content shape, or `null` for missing, draft, or archived content. Treat `null` as “This announcement is no longer available.” Never use the staff-only `listAdmin` query in the student UI.

## Home UI contract

Insert an inline **What’s New** card immediately above **Confidence Rate** in `src/app/(tabs)/index.tsx`. Follow the mobile app's existing theme; do not copy the admin's fixed palette into the app.

- Loading: compact skeleton in the announcement area; do not block Home.
- Empty successful response: “No announcements yet.”
- Loaded: title, localized publication date, and a short message preview. Tap to open the full message.
- Additional items: offer **View all** (query a two-item preview if the control should appear only when another item exists).
- Error/offline: localized fallback with a retry path; do not present a request failure as an empty successful response. Use a local error boundary for thrown query failures and the app's connectivity state for disconnection, since `undefined` alone means loading.
- Detail: allow scrolling for long messages, large text, both themes, and accessible labels. If an announcement is unpublished while open, replace the content with the unavailable state.

No automatic popup, push notification, read tracking, audience targeting, scheduled publishing, or uploads are included in this first version.

## Typography for the pitch deck

The current native Home uses the system font without an explicit custom family. The web theme declares Spline Sans, Inter, then system fallbacks; the admin declares Inter then system fallbacks. Neither declaration alone guarantees a font is installed or bundled. Inter is a proposed presentation standard, not a confirmed cross-platform app font. Confirm the intended mobile font with Jecho before finalizing slides.

## Acceptance checks for mobile integration

1. With no announcements, Home shows the empty card above Confidence Rate.
2. A saved draft is invisible to reader queries and cannot be accessed by ID.
3. Publishing shows the new card without an app release; unpublishing removes it.
4. Multiple announcements paginate newest first without drafts or archived content.
5. Long text, large font settings, light/dark themes, slow loading, disconnection, and unavailable detail are usable.
6. No production announcement is published until approved content is supplied.
