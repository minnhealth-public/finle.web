import React, { PropsWithChildren, createContext, useState} from "react";
import { CareTeam } from "../models/careTeam";

const AppContext = createContext(null);


export const AppProvider = (props: PropsWithChildren) => {

  const [careTeamState, setCareTeamState] = useState<CareTeam>(
    () => localStorage.getItem("careTeam")?JSON.parse(localStorage.getItem('careTeam')):null
  )

  const setAppCareTeam = (careTeam: CareTeam) => {
    if(careTeam !== undefined){
      localStorage.setItem("careTeam", JSON.stringify(careTeam))
      setCareTeamState(careTeam)
    }
  }

  // Pass contextData to providers
  const contextData = {
    careTeam: careTeamState,
    setCareTeam: setAppCareTeam,
  }

  return (
      <AppContext.Provider value={contextData}>
          {props.children}
      </AppContext.Provider>
  )
};

export default  AppContext;
