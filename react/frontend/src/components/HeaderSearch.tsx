import React, { SyntheticEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MagnifyingGlassIcon from "../shared/Icon/MagnifyingGlassIcon";

interface HeaderSearchProps {
  searchParamName?: string
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ searchParamName }) => {
  const [paramName] = useState<string>((searchParamName || "query"));
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get(paramName));

  const onSubmitSearch = (e: SyntheticEvent): void => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const value: string = target.query.value;

    searchParams.set(paramName, value);
    if (!value) searchParams.delete(paramName);
    setSearchParams(searchParams);
  }

  useEffect(() => {
    // Create a timer variable to store the setTimeout ID
    let timer: NodeJS.Timeout;

    // Clear the existing timer (if any) when the searchQuery changes
    clearTimeout(timer);

    // Set a new timer to execute the 'bob' function after 2 seconds of typing inactivity
    timer = setTimeout(() => {
      searchParams.set(paramName, searchQuery);
      if (!searchQuery) searchParams.delete(paramName);
      setSearchParams(searchParams);
    }, 1000);

    // Cleanup: Clear the timer if the component unmounts or if searchQuery changes
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, searchParams]);


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <search className="rounded-md w-9 " onSubmit={onSubmitSearch}>
      <label
        htmlFor="sitesearch"
        className={`transition-all relative duration-500 m-0 h-full text-white-1 group`}
      >
        <input
          type="text"
          placeholder="Search"
          name="query"
          id="sitesearch"
          value={searchQuery || ''}
          onChange={handleInputChange}
          className={`
            absolute transition-all duration-500 rounded-md text-black w-0 h-full
            placeholder:font-semibold
            right-0
            peer
            focus:pl-4 focus:w-56
            `}
        />
        <div id="header-search" className="cursor-pointer absolute w-4 right-4 top-1/2 -translate-y-1/2 peer-focus:text-gray-400">
          <MagnifyingGlassIcon />
        </div>
      </label>
    </search>
  );
}

export default HeaderSearch;
