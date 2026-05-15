import { ClipboardList, Home, ShoppingBag, Sprout } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const items = [
  { to: '/anotacoes', label: 'Anotações', Icon: ClipboardList, end: false },
  { to: '/', label: 'Início', Icon: Home, end: true },
  { to: '/listas', label: 'Listas', Icon: ShoppingBag, end: false },
  { to: '/catalogo', label: 'Catálogo', Icon: Sprout, end: false },
];

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      <ul className={styles.list}>
        {items.map(({ to, label, Icon, end }) => (
          <li key={to} className={styles.item}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : null].filter(Boolean).join(' ')
              }
            >
              <span className={styles.indicator} aria-hidden="true" />
              <Icon size={22} strokeWidth={2} />
              <span className={styles.label}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
