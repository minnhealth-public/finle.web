import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from '../../shared/Form';
import { useQuery } from '@tanstack/react-query';
import Resource, { ResourceFilter } from '../../models/resource';
import { getResourceFilters, getResources } from '../../api/resource';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import ResourceCard from '../../components/ResourceCard';
import {PageSubtitle, PageTitle} from '../../shared/View';
import Pagination from '../../components/Pagination';
import ResourceModal from '../../components/ResourceModal';
import ResourceFilters from '../../components/ResourceFilters/ResourceFilters';


const ResourcePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const axiosPrivate = useAxiosPrivate();
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  const clearAll = () => {
    setSearchParams({});
  }

  // Page data
  const [currentPage, setCurrentPage] = useState<number>(
    (searchParams.get("page") ? parseInt(searchParams.get("page")) : 1)
  );

  const [resource, setResource] = useState<Resource>(null)

  const pageSize = 6;

  const { isLoading, data } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => getResources(axiosPrivate)
  });

  useEffect(() => {
    if (data) {
      let resources = data.filter((resource: Resource) => {
        const query = searchParams.get('query')
        if (query) {
          return resource.description.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        }
        return true;
      })

      if (searchParams.getAll('topics').length > 0) {
        resources = resources.filter((resource: Resource) => {
          return !!resource.topics.find(
            (topic: any) => searchParams.getAll("topics").indexOf(topic.id.toString()) != -1
          )
        })
      }

      if (searchParams.getAll('tasks').length > 0) {
        resources = resources.filter((resource: Resource) => {
          return !!resource.tasks.find(
            (task: any) => searchParams.getAll("tasks").indexOf(task.id.toString()) != -1
          )
        })
      }

      if (searchParams.getAll('types').length > 0) {
        resources = resources.filter((resource: Resource) => searchParams.getAll("types").indexOf(resource.type) != -1)
      }

      setFilteredResources(resources);

      setResource(data.find((resource: Resource) => {
        return resource.id == parseInt(searchParams.get("resource"))
      }))
    }
  }, [data, searchParams])

  return (
    <>
      <div id="resources-page" className="container mx-auto mb-14">
        <div id="resources-title" className="md:basis-2/5 mt-6 space-y-4">
          <PageTitle>Resources</PageTitle>
          <div className="md:flex items-center">
            <PageSubtitle>Explore, download, and print any of these resources that you find valuable.</PageSubtitle>
          </div>
        </div>
        <div className="flex flex-col gap-4 my-4">
          <div className="flex items-baseline">
            <SearchInput />
            <button
              className="
              mx-6 font-sans text-gray-350 font-bold uppercase text-md bold
              hover:text-gray-400 active:text-gray-400 focus:text-gray-400
            "
              onClick={() => clearAll()}>reset</button>
          </div>
          <ResourceFilters />
          {isLoading && "...loading"}
          {data &&
            <div>
              <div className="flex my-4">
                <div className="flex-grow"></div>
                <Pagination perPage={pageSize} length={filteredResources.length} onPageChange={setCurrentPage} />
              </div>
              <div className="md:grid md:grid-cols-2">
                {
                  filteredResources
                    .slice(
                      (currentPage - 1) * pageSize,
                      (currentPage - 1) * pageSize + pageSize,
                    )
                    .map((resource: Resource, idx: number) => {
                      return <ResourceCard key={idx} data={resource} idx={idx} />
                    })
                }
              </div>
              <div className="flex my-4">
                <div className="flex-grow"></div>
                <Pagination perPage={pageSize} length={filteredResources.length} onPageChange={setCurrentPage} />
              </div>
            </div>
          }
        </div>
      </div>
      {resource &&
        <ResourceModal resource={resource} />
      }
    </>
  );
};

export default ResourcePage;
