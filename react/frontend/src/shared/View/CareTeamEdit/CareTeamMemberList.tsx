import React, { useContext, useEffect } from "react";
import CareTeamContext from "../../../contexts/CareTeamContext";
import { CareTeamMember } from "../../../models/careTeam";


const CareTeamEdit: React.FC = () => {

  let {
    careTeam,
    setCurrentMember,
    selectedMemberIdx
  } = useContext(CareTeamContext);

  useEffect(() => { }, [careTeam])

  return <>
    <div className="flex flex-col gap-6">
      <div>
        {careTeam?.members && careTeam?.members.map((member: CareTeamMember, idx: number) => {
          return (
            <div key={idx} className="flex flex-row justify-between">
              <div>{member.email} ({member.relation})</div>
              {selectedMemberIdx !== idx &&
                <button
                  className="hover:text-primary_alt active:text-primary_alt"
                  onClick={() => setCurrentMember(idx)}
                >
                  edit
                </button>
              }
            </div>
          )
        })}
      </div>
    </div>
  </>
}

export default CareTeamEdit;
