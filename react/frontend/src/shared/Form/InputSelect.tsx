import React, { ForwardedRef, InputHTMLAttributes, SyntheticEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';


interface InputSelectProps extends InputHTMLAttributes<HTMLInputElement> {
  // Additional props specific to your Input component, if any
  options: string[]
}

const InputSelect = forwardRef<HTMLInputElement, InputSelectProps>((
  { options, ...props },
  ref: ForwardedRef<HTMLInputElement>
) => {
   const inputRef = useRef(null);
   let selectRef = useRef(null);
   let [showSelect, setShowSelect] = useState(false);

   const toggleSelect = () => {
      if(!showSelect){
         inputRef.current.focus();
      }
      setShowSelect(!showSelect)
   }
   // Expose the internal inputRef methods to the parent component
   useImperativeHandle(ref, () => inputRef.current!, []);


   const selectOption = (evt: SyntheticEvent) => {
      evt.preventDefault()
      evt.stopPropagation()
      if (!(evt.target instanceof HTMLDivElement)) {
         return;
      }
      const divElement: HTMLDivElement = evt.target;
      inputRef.current.value = divElement.dataset.value;
      inputRef.current.focus();
   }

   return (
      <div className="relative">
         <div>
            <input
               {...props}
               ref={inputRef}
               tabIndex={0}
               className="border-2 rounded-md p-3"
               onBlur={() => {if(showSelect) setTimeout(() => toggleSelect(), 100);}}
               type="text"
            />
           <FontAwesomeIcon
               tabIndex={0}
               data-testid="chevron-down-icon"
               className="right-1 absolute hover:cursor-pointer w-9 py-4 focus:outline-1"
               onClick={() => {toggleSelect()}}
               onKeyUp={(evt) => { if (evt.key === 'Enter') toggleSelect()}}
               onBlur={() => {if(showSelect) setTimeout(() => toggleSelect(), 100);}}
               icon={faChevronDown}
            />
            <div
               ref={selectRef}
               className={`rounded-md border-2 w-full absolute ${showSelect?'': 'hidden'} bg-white-1 py-3 mt-2`}
               >
               {options.map((option, idx) => {
                  return <div
                     tabIndex={0}
                     className="p-3 hover:cursor-pointer hover:bg-teal-400 focus:bg-teal-400 hover:text-white-1 focus:text-white-1"
                     onClick={(evt) => selectOption(evt)}
                     onKeyUp={(evt) => { if (evt.key === 'Enter') selectOption(evt)}}
                     key={idx}
                     data-value={option}>
                     {option}
                  </div>
               })}
            </div>

         </div>
      </div>
   )
})
export default InputSelect;
