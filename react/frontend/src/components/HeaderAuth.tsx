import React, { useEffect, useMemo, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { getUserCareTeams } from "../api/user";
import NavigationDropDown from '../shared/NavigationLink/NavigationDropDown';
import UserCircle from '../shared/View/UserCircle';
import { CareTeam, CareTeamMember } from '../models/careTeam';
import { useStore } from '../store';
import { NavigationLink } from '../shared/NavigationLink';
import resolveConfig from 'tailwindcss/resolveConfig'
import TextCircle from '../shared/View/TextCircle';

import tailwindConfig from '../../tailwind.config.js'
import { Link } from 'react-router-dom';
import ChevronIcon from '../shared/Icon/ChevronIcon';
const fullConfig: any = resolveConfig(tailwindConfig)


const HeaderAuth: React.FC = () => {

  const { user, careTeam, setCareTeam, setCareTeams } = useStore();

  const axiosPrivate = useAxiosPrivate();

  const dropDownRef = useRef(null);

  const careTeamQuery = useQuery<CareTeam[]>({
    queryKey: ["careTeams", user?.id],
    queryFn: () => getUserCareTeams(axiosPrivate),
  })

  const getMessages = useMemo(() => {
    if (!careTeam) {
      return 0
    }
    const tempMember = careTeam.members.find((member: CareTeamMember) => {
      return member.memberId == user.id
    });
    if (tempMember) {
      return tempMember.notificationCount;
    } else {
      return 0
    }
  }, [user, careTeam])

  // If care team is not set yet set if when we get data back from the care team query for the user
  useEffect(() => {
    if (!(!!careTeamQuery?.data))
      return;

    setCareTeams(careTeamQuery.data)
    // if careTeam is null then tmpCareTeam will be null/undefined
    let tmpCareTeam = careTeamQuery.data.find((iterCareTeam: CareTeam) => iterCareTeam.id === careTeam?.id);

    if (!!tmpCareTeam)
      setCareTeam(tmpCareTeam);
    else
      setCareTeam(careTeamQuery.data[0])

  }, [careTeamQuery.data])

  return <>
    <button>
      <div className="uppercase whitespace-nowrap text-base flex font-semibold pr-4">
        <div id="team-selector" className="flex md:gap-1 content-center relative">
          <div className="
              group
              flex
              rounded-lg
              px-4
              py-2
              ">
            <Link className="relative" to={'/my-notes'}>
              {careTeam?.name}
              {getMessages > 0 && <div className="w-5 h-5 absolute -right-3 -top-3">
                <TextCircle text={getMessages.toString()} color={fullConfig.theme.colors.teal['400']} />
              </div>
              }
            </Link>

            {careTeamQuery?.data?.length > 1 &&
              <>
                <div className="ml-2 w-5 h-5 -rotate-90"><ChevronIcon /></div>
                <div ref={dropDownRef} className="
                hidden absolute top-8 right-0 p-4 rounded-lg z-10
                group-hover:bg-tan-100 group-hover:shadow-lg group-hover:block
                group-hover:animate-reveal
                ">
                  <div className="flex flex-col gap-2">
                    {careTeamQuery.data && careTeamQuery.data.map((iterCareTeam: CareTeam, idx: number) => {
                      return (
                        <p
                          key={idx}
                          className="nav-link text-lg"
                          onClick={() => setCareTeam(iterCareTeam)}
                        >
                          {iterCareTeam.name}
                        </p>
                      )
                    })}
                  </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </button>

    <button aria-label="User drop down" className="font-semibold flex flex-row ml-auto">
      <NavigationDropDown id="profile-nav"
        label={
          <UserCircle
            className="w-10 h-10"
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
          />
        }
        right
      >
        <NavigationLink href="/account" label="Account" id="account-nav" />
        <NavigationLink href="logout" label="Logout" id="logout-nav" />
      </NavigationDropDown>

    </button>
  </>
}

export default HeaderAuth;
