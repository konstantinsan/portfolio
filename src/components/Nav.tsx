import { useFlow } from '@/state/flow'

export default function Nav() {
  const flow = useFlow()
  return (
    <nav className="navbar">
      <div className="navbar-underglow" />
      <div className="navbar-inner">
        <button
          type="button"
          className="font-display nav-logo nav-logo-btn"
          onClick={() => {
            if (flow.overlay) {
              flow.closeOverlay()
            } else {
              flow.goTo(0)
            }
          }}
          aria-label="Back to landing"
        >
          KAUDIO
        </button>
        <div className="nav-links">
          <button className="nav-link" onClick={() => flow.openOverlay('about')}>About</button>
          <button className="nav-link" onClick={() => flow.openOverlay('contact')}>Contact</button>
        </div>
      </div>
    </nav>
  )
}
