import { useFlow } from '@/state/flow'

export default function StickyContactBar() {
  const flow = useFlow()
  const hidden = flow.overlay === 'contact'
  return (
    <div className={`sticky-contact-bar ${hidden ? 'hidden' : ''}`}>
      <div className="sticky-contact-bar-inner">
        <a className="btn-gradient" href="mailto:konstantin.zlatkov1997@gmail.com">Email</a>
        <a className="btn-gradient" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn-gradient" href="https://upwork.com" target="_blank" rel="noreferrer">Upwork</a>
      </div>
    </div>
  )
}
