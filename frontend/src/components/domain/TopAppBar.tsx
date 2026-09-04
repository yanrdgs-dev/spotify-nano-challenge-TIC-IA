// Barra superior simples: menu + logo + avatar (desktop e mobile).
// Usada em telas de tarefa única, como Upload.

import { Link } from 'react-router-dom'
import { Icon } from '../ui/Icon'

export function TopAppBar() {
  return (
    <>
      {/* Desktop */}
      <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-margin-desktop h-16 backdrop-blur-xl bg-surface/10 shadow-[0_0_20px_rgba(255,181,161,0.2)]">
        <div className="flex items-center gap-4">
          <Icon
            name="menu"
            className="text-primary cursor-pointer hover:text-secondary transition-colors duration-500"
          />
          <Link
            to="/"
            className="font-headline-md text-headline-md font-bold tracking-tighter text-primary"
          >
            VIBE_LAB
          </Link>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline/30" />
      </header>

      {/* Mobile */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 backdrop-blur-xl bg-surface/10 shadow-[0_0_20px_rgba(255,181,161,0.2)]">
        <Icon name="menu" className="text-primary" />
        <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
          VIBE_LAB
        </span>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline/30" />
      </header>
    </>
  )
}