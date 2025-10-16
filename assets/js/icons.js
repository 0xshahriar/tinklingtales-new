export const ICONS = {
  logo: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <circle cx="12" cy="12" r="5.25" fill="currentColor" opacity="0.08" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
  `,
  menu: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <line x1="3.5" y1="6" x2="20.5" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="3.5" y1="18" x2="20.5" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `,
  close: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `,
  star: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.75l2.22 4.5 4.97.72-3.6 3.49.85 4.95L12 15.8l-4.44 2.33.85-4.95-3.6-3.49 4.97-.72L12 3.75z"
        fill="currentColor"
      />
    </svg>
  `,
  heart: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.25l-1.09-.99C6.2 15.06 3.5 12.64 3.5 9.36 3.5 7 5.33 5.1 7.63 5.1c1.36 0 2.68.63 3.52 1.64.84-1.01 2.16-1.64 3.52-1.64 2.3 0 4.13 1.9 4.13 4.26 0 3.28-2.69 5.7-7.41 9.91L12 20.25z"
        fill="currentColor"
      />
    </svg>
  `,
  heartOutline: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.25l-1.09-.99C6.2 15.06 3.5 12.64 3.5 9.36 3.5 7 5.33 5.1 7.63 5.1c1.36 0 2.68.63 3.52 1.64.84-1.01 2.16-1.64 3.52-1.64 2.3 0 4.13 1.9 4.13 4.26 0 3.28-2.69 5.7-7.41 9.91L12 20.25z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <line x1="16.25" y1="16.25" x2="20.5" y2="20.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  `,
  facebook: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M13.5 20.5v-6h2.02l.3-2.34H13.5v-1.49c0-.68.19-1.14 1.18-1.14h1.26V7.44c-.22-.03-.97-.09-1.83-.09-1.81 0-3.05 1.1-3.05 3.11v1.74H8.5v2.34h2.56v6h2.44z"
        fill="currentColor"
      />
    </svg>
  `,
  instagram: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" ry="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  `,
  messenger: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.5c-4.7 0-8.5 3.55-8.5 7.94 0 2.51 1.27 4.7 3.24 6.14v2.92l2.95-1.61c.73.2 1.5.31 2.31.31 4.7 0 8.5-3.55 8.5-7.94S16.7 3.5 12 3.5zm4.12 6.29l-2.72 2.88-2.16-2.1-3.95 4.21 2.97-5.27 2.18 2.07 3.68-1.79z"
        fill="currentColor"
      />
    </svg>
  `
};

export function getIcon(name) {
  return ICONS[name] || "";
}
