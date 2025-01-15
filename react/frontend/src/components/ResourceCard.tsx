import React from 'react';
import Resource from '../models/resource';
import { useSearchParams } from 'react-router-dom';

interface ResourceCardProp {
  data: Resource;
  idx: number;
}

const ResourceCard: React.FC<ResourceCardProp> = ({ data, idx }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div
      id={`resource-${idx}`}
      onClick={() => {
        searchParams.set("resource", data.id.toString())
        setSearchParams(searchParams)
      }
      }
      className="bg-white p-8 md:basis-5/12 group hover:bg-tan-100 rounded cursor-pointer h-auto overflow-hidden flex flex-col justify-center"
    >
      <h2 className="text-5xl font-semibold mb-2 group-hover:text-primary_alt line-clamp-2 pb-1">{data.title}</h2>
      <p className="mb-4 line-clamp-3">{data.description}</p>
    </div>
  );
};

export default ResourceCard;
