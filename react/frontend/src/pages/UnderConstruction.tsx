import React, {} from "react";
import { PageTitle } from "../shared/View";

const UnderConstruction: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-8 text-center mb-16">
        <PageTitle>Coming Soon</PageTitle>
        <p>This page is currently under construction</p>
      </div>
    </div>
  );
}

export default UnderConstruction;
