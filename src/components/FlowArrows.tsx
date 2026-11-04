import { motion, AnimatePresence } from 'framer-motion'
import { FLOW, useFlow } from '@/state/flow'

export default function FlowArrows() {
  const flow = useFlow()
  const currentKey = FLOW[flow.index].key
  if (currentKey === 'landing') return null
  const prev = flow.index > 0 ? FLOW[flow.index - 1] : null
  const next = flow.index < FLOW.length - 1 ? FLOW[flow.index + 1] : null

  return (
    <>
      <AnimatePresence>
        {prev && (
          <motion.button
            key="prev"
            className={`flow-arrow prev${flow.scrollDir === 'up' ? ' active' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={flow.scrollDir === 'up'
              ? { opacity: 1, x: 0, scale: [1, 0.82, 1.06, 1] }
              : { opacity: 1, x: 0, scale: 1 }}
            transition={flow.scrollDir === 'up'
              ? { duration: 0.36, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.7, 1] }
              : { duration: 0.2 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ x: -4, transition: { duration: 0.13 } }}
            whileTap={{ scale: 0.82 }}
            onClick={flow.prev}
            aria-label={`Previous: ${prev.label}`}
          >
            <span aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,2 3,7 9,12" /></svg>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {next && (
          <motion.button
            key="next"
            className={`flow-arrow next${flow.scrollDir === 'down' ? ' active' : ''}`}
            initial={{ opacity: 0, x: 20 }}
            animate={flow.scrollDir === 'down'
              ? { opacity: 1, x: 0, scale: [1, 0.82, 1.06, 1] }
              : { opacity: 1, x: 0, scale: 1 }}
            transition={flow.scrollDir === 'down'
              ? { duration: 0.36, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.7, 1] }
              : { duration: 0.2 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ x: 4, transition: { duration: 0.13 } }}
            whileTap={{ scale: 0.82 }}
            onClick={flow.next}
            aria-label={`Next: ${next.label}`}
          >
            <span aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5,2 11,7 5,12" /></svg>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
