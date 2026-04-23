import { FLOW, useFlow } from '@/state/flow'

export default function SectionPills() {
  const flow = useFlow()
  return (
    <div className="pill-nav" role="tablist" aria-label="Section navigation">
      {FLOW.map((s, i) => {
        const active = i === flow.index
        return (
          <button
            key={s.key}
            className={`pill-nav-item ${active ? 'active' : ''}`}
            onClick={() => flow.goTo(i)}
            role="tab"
            aria-selected={active}
            aria-label={s.label}
            title={s.label}
          >
            <span className="pill-dot" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
