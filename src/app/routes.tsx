import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUsuarioStore } from '@stores/usuarioStore';
import { OnboardingPage } from '@features/onboarding/OnboardingPage';
import { HomePage } from '@features/home/HomePage';
import { SelecionarProdutos } from '@features/listas/pages/SelecionarProdutos';
import { ListaDetalhe } from '@features/listas/pages/ListaDetalhe';
import { AnotacoesPage } from '@features/anotacoes/AnotacoesPage';
import { ListasPage } from '@features/listas/pages/ListasPage';
import { CatalogoPage } from '@features/catalogo/CatalogoPage';
import { ConfiguracoesPage } from '@features/configuracoes/ConfiguracoesPage';
import { DesignSystemPage } from '@features/design-system/DesignSystemPage';

function RequireOnboarding({ children }: { children: ReactNode }) {
  const isOnboarded = useUsuarioStore((s) => s.isOnboarded);
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function RequireNotOnboarded({ children }: { children: ReactNode }) {
  const isOnboarded = useUsuarioStore((s) => s.isOnboarded);
  if (isOnboarded) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Onboarding — acessível só se não onboarded */}
      <Route
        path="/onboarding"
        element={
          <RequireNotOnboarded>
            <OnboardingPage />
          </RequireNotOnboarded>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <RequireOnboarding>
            <HomePage />
          </RequireOnboarding>
        }
      />
      <Route
        path="/listas"
        element={
          <RequireOnboarding>
            <ListasPage />
          </RequireOnboarding>
        }
      />
      <Route
        path="/listas/nova"
        element={
          <RequireOnboarding>
            <SelecionarProdutos />
          </RequireOnboarding>
        }
      />
      <Route
        path="/listas/:id"
        element={
          <RequireOnboarding>
            <ListaDetalhe />
          </RequireOnboarding>
        }
      />
      <Route
        path="/anotacoes"
        element={
          <RequireOnboarding>
            <AnotacoesPage />
          </RequireOnboarding>
        }
      />
      <Route
        path="/catalogo"
        element={
          <RequireOnboarding>
            <CatalogoPage />
          </RequireOnboarding>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <RequireOnboarding>
            <ConfiguracoesPage />
          </RequireOnboarding>
        }
      />

      {/* Design system — apenas durante desenvolvimento */}
      <Route path="/design-system" element={<DesignSystemPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
