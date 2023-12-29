import React from 'react';
import { Partner } from '../../models';
import { useQuery } from '@tanstack/react-query';
import { getPartners } from '../../api/partners';

const PartnerResults: React.FC = () => {

  const partnersQuery = useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: () => getPartners()
  });

  if (partnersQuery.isLoading) return <>Loading...</>;
  if (partnersQuery.error) return <>Error Fetching data</>;

  return <>
    <div className="flex flex-col">
      {partnersQuery.data.map((partner: Partner, idx: number) => {
        return (
          <div key={idx}>
            <div className="py-20 md:flex md:flex-row gap-3">
              <div className="md:flex  md:w-2/5 my-auto align-middle justify-center text-teal-500 font-bold text-2xl text-center ">
                <img src={partner.logo}/>
              </div>
              <div className="flex flex-col gap-3">
                <div>{partner.name}</div>
                <div className="text-sm">{partner.description}</div>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-teal-400 active:text-teal-400 text-teal-500 font-bold"
                  href={partner.link}
                >
                  {partner.link}
                </a>
              </div>
            </div>
            {idx+1 < partnersQuery.data.length?<div className="border-b-2 border-teal-400"/>:<></>}
          </div>
        )
      })}
    </div>
  </>
}

export default PartnerResults;
