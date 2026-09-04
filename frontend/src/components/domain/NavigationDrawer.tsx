// Menu lateral fixo (apenas desktop), com avatar do usuário e navegação
// temática do produto. Os itens Discover/Radio/Mixtapes/Concerts são
// decorativos — refletem o mockup, sem rota própria no app ainda.

import { Icon } from '../ui/Icon'

const navItems = [
  { icon: 'search', label: 'Discover' },
  { icon: 'radio', label: 'Radio', active: true },
  { icon: 'album', label: 'Mixtapes' },
  { icon: 'event', label: 'Concerts' },
]

export function NavigationDrawer() {
  return (
    <aside className="hidden md:flex flex-col h-full p-6 space-y-4 w-80 rounded-r-xl bg-surface-container-high shadow-2xl shadow-primary/10 fixed left-0 top-0 z-40">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden" />
        <div>
          <h2 className="font-headline-md text-headline-md text-primary text-xl">
            Desert Wanderer
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm opacity-80">
            Aura: Golden Hour
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (          
        <a   key={item.label}
            href="#"
            className={
              item.active
                ? 'flex items-center space-x-3 px-4 py-3 rounded-lg text-secondary font-bold bg-surface-variant/30 transition-all duration-500 ease-in-out'
                : 'flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-all duration-500 ease-in-out'
            }
          >
            <Icon name={item.icon} />
            <span className="font-label-md text-label-md">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto">
        
      <a    href="#"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-all duration-500 ease-in-out"
        >
          <Icon name="settings" />
          <span className="font-label-md text-label-md">Settings</span>
        </a>
      </div>
    </aside>
  )
}