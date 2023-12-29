import React from 'react';
import { useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { getUserCareTeams } from "../api/user";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faUser, } from '@fortawesome/free-regular-svg-icons';
import NavigationDropDown from '../shared/NavigationLink/NavigationDropDown';
import { useNavigate } from 'react-router-dom';


const HeaderAuth: React.FC = () => {

    const axiosPrivate = useAxiosPrivate();
    let {user, logoutUser} = useAuth();

    const careTeamQuery =  useQuery<any[]>({
      queryKey: ["careTeam", user.userId],
      queryFn: () => getUserCareTeams(axiosPrivate)
    })


    return <>
      <button>
        <div className="bold uppercase whitespace-nowrap flex items-center pr-4">

          Care Team 
          <FontAwesomeIcon icon={faChevronDown} className="w-4 pl-2"/>
        </div>
      </button>

      <button className="w-8">
        <FontAwesomeIcon icon={faEnvelope} className="w-4"/>
      </button>
      <button className="w-8">
        <NavigationDropDown label={<FontAwesomeIcon icon={faUser} className="w-4"/>}>
            <div className="relative">
                <ul className="p-2 bg-grey-650 -left-10 -top-2 absolute">
                    <p onClick={() => {
                        logoutUser();
                    }}>Logout</p>
                    <p>Info</p>
                </ul>
            </div>
        </NavigationDropDown>

      </button>
    </>
}

export default HeaderAuth;
