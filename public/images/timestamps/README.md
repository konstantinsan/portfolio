Put timestamp thumbnail images here.

Use them in video components with root-relative URLs:

```tsx
timestamps={[0.25, 0.5, 0.75, 0.9]}
thumbnails={[
  '/images/timestamps/demo-25.jpg',
  '/images/timestamps/demo-50.jpg',
  '/images/timestamps/demo-75.jpg',
  '/images/timestamps/demo-90.jpg',
]}
thumbnailUrl="/images/timestamps/demo-hero.jpg"
```

If a thumbnail slot is missing, leave that array item `undefined`; the UI falls back to the numbered placeholder.
