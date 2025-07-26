import React, {useState} from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'


export default function Accordion({title, defaultOpen = false, children}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className='chevron'>
      <button className='' onClick={() => setOpen(o => !o)}
      >
        {title}
        {open ? <FiChevronUp size={48}  /> : <FiChevronDown size={48}  /> }
      </button>
      {open && (
        <div className=''>
          {children}
        </div>
      )}
    </div>
  )
}