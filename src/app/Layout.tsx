import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from '@components/BottomNav';
import { ToastPortal } from '@components/Toast';
import { useLembretes } from '@features/anotacoes/hooks/useLembretes';

type LayoutProps = {
  children: ReactNode;
};

const HIDE_NAV_PATHS = ['/onboarding'];

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV_PATHS.includes(pathname);
  useLembretes();

  return (
    <div className="app-shell">
      <main className="app-content">{children}</main>
      {showNav && <BottomNav />}
      <ToastPortal />
    </div>
  );
}
