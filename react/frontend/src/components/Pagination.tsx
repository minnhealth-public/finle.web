import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ChevronIcon from '../shared/Icon/ChevronIcon';

interface PaginationProp {
  perPage?: number
  length: number
  onPageChange: (page: number) => void

}

const Pagination: React.FC<PaginationProp> = ({ perPage, length, onPageChange }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation();
  const [pages, setPages] = useState(0)

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page")) || 1)

  useEffect(() => {
    // if we dont' have a length don't set anything
    if (length == 0)
      return
    const pages = Math.ceil(length / perPage);
    setCurrentPage(parseInt(searchParams.get("page")) || 1)
    setPages(pages);
    if (pages < currentPage) {
      setPage(pages);
    }
  }, [perPage, length, setPages, location])


  const prevousPage = () => {
    if (currentPage === 1)
      return
    const tmpPage = currentPage - 1;
    setPage(tmpPage);
  }

  const nextPage = () => {
    if (currentPage >= pages)
      return
    const tmpPage = currentPage + 1;
    setPage(tmpPage);
  }

  const setPage = (pageNum: number) => {
    searchParams.set("page", pageNum.toString());
    setCurrentPage(pageNum);
    setSearchParams(searchParams);
    onPageChange(pageNum)
  }

  const handleKeyDown = (event: any, pageNum: number) => {
    if (event.key === " ") {
      event.preventDefault();
      setPage(pageNum);
      return false;
    }
  }

  const handleKeyDownNext = (event: any) => {
    if (event.key === " ") {
      event.preventDefault();
      nextPage();
      return false;
    }
  }
  const handleKeyDownPrevious = (event: any) => {
    if (event.key === " ") {
      event.preventDefault();
      prevousPage();
      return false;
    }
  }

  const getSurroundingPages = () => {
    if (currentPage == 1) {
      return [currentPage, currentPage + 1];
    } else if (currentPage === pages) {
      return [currentPage - 1, currentPage];
    } else {
      return [currentPage - 1, currentPage, currentPage + 1]
    }
  }

  const paginationNumber = (pageNumber: number) => {
    return <span
      onClick={() => setPage(pageNumber)}
      onKeyDown={(event) => handleKeyDown(event, pageNumber)}
      tabIndex={0}
      key={pageNumber}
      className={`
              cursor-pointer font-bold text-lg
            hover:text-primary_alt focus:text-primary_alt
            ${currentPage === pageNumber ? "text-primary_alt" : ""}
            `}
    >
      {pageNumber}
    </span>
  }
  /* If length is larger than 5 pages split up into three chunks */
  const displayPages = useMemo(() => {
    if (pages > 5) {
      const surroundingPages = getSurroundingPages();
      return (
        <>
          {surroundingPages.indexOf(1) == -1 &&
            <>
              {paginationNumber(1)}
              <span>...</span>
            </>
          }
          {surroundingPages.map((pageNumber: number) => {
            return paginationNumber(pageNumber)
          })}
          {surroundingPages.indexOf(pages) == -1 &&
            <>
              <span>...</span>
              {paginationNumber(pages)}
            </>
          }
        </>

      );
    } else {
      return [...Array(pages)].map((_: number, idx: number) => {
        return paginationNumber(idx + 1)
      })
    }
  }, [pages, currentPage])

  return <>
    <div className="
      flex items-center gap-2 text-gray-500
      ">
      <button
        aria-label="page back"
        onClick={prevousPage}
        onKeyDown={(event) => handleKeyDownPrevious(event)}
        className="w-4 cursor-pointer hover:text-primary_alt focus:text-primary_alt"
      >
        <ChevronIcon />
      </button>
      {displayPages}
      <button
        aria-label="page forward"
        onClick={nextPage}
        onKeyDown={(event) => handleKeyDownNext(event)}
        className="w-4 cursor-pointer hover:text-primary_alt focus:text-primary_alt rotate-180"
      >
        <ChevronIcon />
      </button >
    </div >
  </>
}

export default Pagination;
