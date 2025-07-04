import React, {useState} from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'


export default function Accordion({title, defaultOpen = false, children}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className='w-full max-w-2xl mx-auto mb-4 bg-columbia rounded-lg shadow'>
      <button className='w=full flex items-center justify-betwee px-6 py-4 text-stormcloud text-lg font-medium focus:online-none
      
      'onClick={() => setOpen(o => !o)}
      >
        {title}
        {open ? <FiChevronUp /> : <FiChevronDown /> }
      </button>
      {open && (
        <div className='px-6 pb-6 pb-beige text-gray-700'>
          {children}
        </div>
      )}
    </div>
  )
}