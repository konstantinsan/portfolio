import { FLOW, useFlow } from '@/state/flow'

export default function Nav() {
  const flow = useFlow()
  return (
    <nav className="navbar">
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
      <div className="nav-progress" role="tablist" aria-label="Section navigation">
        {FLOW.map((s, i) => {
          const active = i === flow.index
          return (
            <button
              key={s.key}
              type="button"
              className={`nav-progress-tick${active ? ' active' : ''}`}
              onClick={() => flow.goTo(i)}
              role="tab"
              aria-selected={active}
              aria-label={s.label}
              title={s.label}
            >
              <span className="nav-progress-label font-display" aria-hidden="true">{String(i + 1).padStart(2, '0')} {s.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
