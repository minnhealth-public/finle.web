import React, { ReactNode } from 'react';
import { GlossaryItem } from '../../models';
import { getGlossary } from '../../api/glossary';
import { useQuery } from '@tanstack/react-query';
import { GlossaryLetterGrouping, GlossaryModal } from '.';
import { useSearchParams } from 'react-router-dom';

const GlossaryResults: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const alphabet: string[] = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

  const glossaryQuery = useQuery<GlossaryItem[]>({
    queryKey: ["glossary"],
    queryFn: () => getGlossary()
  });

  const groupByFirstLetter = (items: GlossaryItem[]): { [key: string]: GlossaryItem[] } => {
    return items.reduce((result, item) => {
      const firstLetter = item.term.charAt(0).toUpperCase();

      if (!result[firstLetter]) {
        result[firstLetter] = [];
      }

      result[firstLetter].push(item);
      return result;
    }, {} as { [key: string]: GlossaryItem[] });
  }

  const selectLetterGroup = (letter: string) => {
    const curLetters: string[] = searchParams.getAll("letterGroup");
    if (curLetters.indexOf(letter) !== -1) {
      searchParams.delete("letterGroup", letter);
    } else {
      searchParams.append("letterGroup", letter);
    }
    setSearchParams(searchParams);
  }

  if (glossaryQuery.isLoading) return <>...</>;
  if (glossaryQuery.error) return <>Error Fetching data</>;

  const curLetters: string[] = searchParams.getAll("letterGroup");
  const query = searchParams.get("query")?.toLocaleLowerCase();
  const termCatalogByLetter = groupByFirstLetter(glossaryQuery.data);
  const termCatalog: Record<number, GlossaryItem> = glossaryQuery.data.reduce((result, item) => {
    const { id } = item;
    result[id] = item;
    return result;
  }, {} as Record<number, GlossaryItem>);

  let sortedLetters = Object.keys(termCatalogByLetter).sort();
  const selectedTerm: GlossaryItem | null = searchParams.get("term") ? termCatalog[parseInt(searchParams.get("term"))] : null;

  const elements: ReactNode[] = [];

  if (curLetters.length !== 0) {
    sortedLetters = curLetters.sort()
  }
  sortedLetters.forEach((letter: string) => {
    if (termCatalogByLetter.hasOwnProperty(letter)) {
      let resItems = termCatalogByLetter[letter];
      if (query) {
        resItems = resItems.filter(item => item.term.toLowerCase().includes(query));
      }
      if (resItems.length > 0) {
        elements.push(<GlossaryLetterGrouping key={letter} letter={letter} terms={resItems} />)
      }
    }
  });

  return <>
    <div className="text-3xl align-middle items-start justify-center flex-row flex-wrap flex gap-3">
      {alphabet.map((letter, idx) =>
        <button
          id={`glossary-${idx}`}
          disabled={!(letter in termCatalogByLetter)}
          key={idx}
          className={
            `font-bold disabled:text-gray-350 ${curLetters.indexOf(letter) !== -1 ?
              "text-primary hover:text-primary_alt focus:text-primary_alt" :
              "hover:text-primary_alt focus:text-primary_alt"}`
          }
          onClick={() => selectLetterGroup(letter)}
        >
          {letter}
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {elements}
    </div>
    {selectedTerm &&
      <GlossaryModal item={selectedTerm} />
    }
  </>
}

export default GlossaryResults;
