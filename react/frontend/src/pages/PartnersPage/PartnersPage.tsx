import React, {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import PartnerResults from "../../components/Partner/PartnerResults";
// import {Pagination} from "../components/Pagination";

const PartnersPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-7xl text-blue-450 md:w-1/2">
            A collective vision
        </h1>
        <p className="md:w-1/2 font-bold text-lg">
          There is strength in sharing knowledge. We've come together to empower those affected by Dementia or Alzheimers.
        </p>
        <PartnerResults/>
      </div>
    </div>
  )
}

export default PartnersPage;
