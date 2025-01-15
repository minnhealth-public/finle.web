import React, { ForwardedRef, SyntheticEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MagnifyingGlassIcon from "../Icon/MagnifyingGlassIcon";

interface SearchInputProps {
  searchParamName?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((
  { searchParamName },
  ref: ForwardedRef<HTMLInputElement>
) => {
  const inputRef = useRef(null);
  const [paramName] = useState<string>((searchParamName || "query"));
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(null);

  useImperativeHandle(ref, () => inputRef.current, []);

  const onSubmitSearch = (e: SyntheticEvent): void => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const value: string = target.query.value;

    searchParams.set(paramName, value);
    if (!value) searchParams.delete(paramName);
    setSearchParams(searchParams);
  }
  useEffect(() => {
    inputRef.current.value = searchParams.get(paramName);
  }, []);

  useEffect(() => {
    // Create a timer variable to store the setTimeout ID
    let timer: NodeJS.Timeout;

    // Clear the existing timer (if any) when the searchQuery changes
    clearTimeout(timer);

    // Set a new timer to execute the 'bob' function after 2 seconds of typing inactivity
    timer = setTimeout(() => {
      searchParams.set(paramName, inputRef.current.value);
      if (!inputRef.current.value) searchParams.delete(paramName);
      setSearchParams(searchParams);
    }, 1000);

    // Cleanup: Clear the timer if the component unmounts or if searchQuery changes
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, searchParams]);

  const handleInputChange = (evt) => {
    setSearchQuery(evt.target.value);
  }

  return (
    <search className="relative" onSubmit={onSubmitSearch}>

      <label
        id="video-search"
        className={`py-2 text-gray-400 text-md`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type to search..."
          name="query"
          onChange={handleInputChange}
          className={`w-full rounded-md pl-4 py-2 text-gray-400 box-border border-2 border-gray-400 placeholder:text-lg`}
        />


        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4">
          <MagnifyingGlassIcon />
        </div>
      </label>
    </search>
  );
})

export default SearchInput;
