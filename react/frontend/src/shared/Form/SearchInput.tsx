import React, {SyntheticEvent, useEffect, useState} from "react";
import {SearchIcon} from "../Icon";
import { useSearchParams } from "react-router-dom";

interface SearchInputProps {
    searchParamName?: string
}

const SearchInput: React.FC<SearchInputProps> = ({searchParamName}) => {
  const [paramName] = useState<string>((searchParamName || "query"));
  let [searchParams, setSearchParams] = useSearchParams();
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
    <form className="rounded-md relative" onSubmit={onSubmitSearch}>
      <input
        type="text"
        placeholder="Search"
        name="query"
        value={searchQuery || ''}
        onChange={handleInputChange}
        className="rounded-md w-64 pl-4 py-2 text-black"
      />
      <button type="submit" className="absolute top-3 right-4 text-gray-400">
        <SearchIcon />
      </button>
    </form>
  );
}

export default SearchInput;
