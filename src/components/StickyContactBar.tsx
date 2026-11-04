import { useFlow } from '@/state/flow'

export default function StickyContactBar() {
  const flow = useFlow()
  const hidden = flow.overlay === 'contact'
  return (
    <div className={`sticky-contact-bar ${hidden ? 'hidden' : ''}`}>
      <div className="sticky-contact-bar-inner">
        <a className="btn-gradient" href="mailto:kaudiodesign@gmail.com">Email</a>
        <a className="btn-gradient" href="https://www.linkedin.com/in/thekonstantin/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn-gradient" href="https://www.upwork.com/freelancers/konstantinzlatkov" target="_blank" rel="noreferrer">Upwork</a>
      </div>
    </div>
  )
}
