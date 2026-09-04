// Barra de navegação inferior (apenas mobile), com os itens temáticos
// do produto. O item ativo é destacado conforme a rota atual.

import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Icon } from '../ui/Icon'

const navItems = [
  { icon: 'explore', label: 'Horizon', to: '/' },
  { icon: 'graphic_eq', label: 'Echoes', to: '/upload' },
  { icon: 'library_music', label: 'Vault', to: '/' },
  { icon: 'flare', label: 'Vibe', to: '/' },
]

export function BottomNavBar() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center py-4 px-margin-mobile backdrop-blur-2xl bg-surface/15 shadow-[0_-5px_25px_rgba(187,136,20,0.15)] rounded-t-xl">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to

        return (
          <Link
            key={item.label}
            to={item.to}
            className={clsx(
              'flex flex-col items-center justify-center transition-all duration-700',
              isActive
                ? 'text-secondary bg-secondary-container/20 rounded-full px-4 py-1 shadow-[0_0_15px_rgba(248,189,75,0.4)] scale-105'
                : 'text-on-surface-variant opacity-70 hover:opacity-100',
            )}
          >
            <Icon name={item.icon} filled={isActive} className="mb-1" />
            <span className="font-label-md text-label-md text-[10px]">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}