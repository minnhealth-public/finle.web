import React, { ForwardedRef, InputHTMLAttributes, SyntheticEvent, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ChevronIcon from '../Icon/ChevronIcon';


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
    if (!showSelect) {
      inputRef.current.focus();
    }
    setShowSelect(!showSelect)
  }
  // Expose the internal inputRef methods to the parent component
  useImperativeHandle(ref, () => inputRef.current, []);


  const selectOption = (evt: SyntheticEvent) => {
    //evt.preventDefault()
    //evt.stopPropagation()
    if (!(evt.target instanceof HTMLDivElement)) {
      return;
    }
    const divElement: HTMLDivElement = evt.target;
    inputRef.current.value = divElement.dataset.value;
    inputRef.current.focus();
  }

  return (
    <div className={`${props.className || ""} relative overflow-visible`}>
      <input
        {...props}
        ref={inputRef}
        className="border-2 rounded-md p-3 w-full placeholder:text-lg pr-12"
        onBlur={() => { if (showSelect) setTimeout(() => toggleSelect(), 100); }}
        type="text"
      />
      <div
        data-testid="chevron-down-icon"
        className="absolute text-gray-350 right-5 top-0 hover:cursor-pointer w-3 py-4 focus:outline-1 hover:text-primary_alt focus:none -rotate-90"
        onClick={() => { toggleSelect() }}
        onKeyUp={(evt) => { if (evt.key === 'Enter') toggleSelect() }}
        onBlur={() => { if (showSelect) setTimeout(() => toggleSelect(), 100); }}
      >
        < ChevronIcon />
      </div>
      <div
        ref={selectRef}
        className={`rounded-md border-2 absolute w-full border-gray-350 ${showSelect ? '' : 'hidden'} bg-white-1 py-3 mt-2`}
      >
        {options.map((option, idx) => {
          return <div
            tabIndex={0}
            className="p-3 z-10 cursor-pointer hover:bg-primary_alt hover:text-white-1 "
            onClick={(evt) => selectOption(evt)}
            onKeyUp={(evt) => { if (evt.key === 'Enter') selectOption(evt) }}
            key={idx}
            data-value={option}>
            {option}
          </div>
        })}
      </div>
    </div>
  )
})
export default InputSelect;
