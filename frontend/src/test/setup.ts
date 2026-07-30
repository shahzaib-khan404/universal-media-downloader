import '@testing-library/jest-dom';

// Stub Next.js router used by components
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: (_k: string) => null }),
  useParams: () => ({}),
}));

// Stub next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Stub sonner toast
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
