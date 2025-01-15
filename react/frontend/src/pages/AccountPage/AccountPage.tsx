
import React, { useMemo, useRef } from 'react';
import { Modal, PageTitle } from '../../shared/View';
import { useQuery } from '@tanstack/react-query';
import { getUserCareTeams } from "../../api/user";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { CareTeam } from '../../models/careTeam';
import { CareTeamProvider } from '../../contexts/CareTeamContext';
import CareTeamList from '../../components/CareTeam/CareTeamList';
import CareTeamAdd from '../../components/CareTeam/CareTeamAdd';
import { useStore } from '../../store';
import ChangePasswordForm from '../../shared/Form/ChangePasswordForm';
import ChangeUserInfoForm from '../../shared/Form/ChangeUserInfoForm';


const AccountPage: React.FC = () => {
  const { user } = useStore()
  const axiosPrivate = useAxiosPrivate();
  const changePasswordRef = useRef(null);
  const editUserRef = useRef(null);

  const careTeamQuery = useQuery<CareTeam[]>({
    queryKey: ["careTeams", user.id],
    queryFn: () => getUserCareTeams(axiosPrivate)
  })

  const greetingMessages = [
    "Welcome back to your account.",
    "Hello, good to see you again.",
    "We're, so glad you're back.",
    "Welcome to your account.",
    "Welcome, good to see you."
  ]

  const greetingMessage = useMemo(() => {
    return greetingMessages[Math.floor(Math.random() * greetingMessages.length)]
  }, []);


  return (
    <div className="container mx-auto mb-14">
      <div className="flex">
        <div className="md:basis-3/5 mb-16">
          <PageTitle>
            {greetingMessage}
          </PageTitle>
        </div>
      </div>


      {/* Care team section */}
      <div id="my-teams">
        <h2 className="text-5xl text-header">My Team{careTeamQuery.data && careTeamQuery.data.length > 1 && "s"}</h2>
        <div className="flex justify-between text-lg">
          <p>
            Manage, change, and add to your team right here.
          </p>
          <CareTeamProvider>
            <CareTeamAdd></CareTeamAdd>
          </CareTeamProvider>
        </div>

        <div className="py-4 flex flex-col space-y-4">
          {careTeamQuery.isLoading ? "Loading..." :
            careTeamQuery.data.map((careTeam: CareTeam, idx: number) => {
              return (
                <CareTeamProvider key={idx} careTeam={careTeam}>
                  <CareTeamList careTeam={careTeam}></CareTeamList>
                </CareTeamProvider>
              )
            })
          }
        </div>
      </div>

      <div className="border-b-2 border-primary"></div>

      {/* other sections*/}
      <div id="my-info" className="pt-4">
        <h2 className="text-5xl text-header flex gap-4 items-baseline">
          Personal Information
          <button
            onClick={() => editUserRef.current.showModal()}
            className="
              text-primary_alt text-sm uppercase font-extrabold
              hover:text-primary focus:text-primary
            "
          >edit</button>
        </h2>
        <div className="flex justify-between text-lg pb-4">
          <p>
            Manage your personal information here.
          </p>
        </div>
        <div className="flex flex-col gap-4">

          <div className="flex items-center">
            <h4 className="md:w-2/5 text-2xl pr-4">Name</h4>
            <div className="">{`${user.firstName} ${user.lastName}`}</div>
          </div>

          <div className="flex items-center">
            <h4 className="md:w-2/5 text-2xl pr-4">Email</h4>
            <div className="">{`${user.email}`}</div>
          </div>

          <div className="flex items-center">
            <h4 className="md:w-2/5 text-2xl pr-4">Password</h4>
            <div className="">
              <button
                className="btn-primary"
                onClick={() => changePasswordRef.current.showModal()}
              >
                Change password
              </button>
            </div>
          </div>

        </div>
      </div>
      <Modal
        ref={editUserRef}
        onClose={() => { editUserRef.current.close() }}
      >
        <ChangeUserInfoForm onSubmit={() => editUserRef.current.close()} />
      </Modal>

      <Modal
        ref={changePasswordRef}
        onClose={() => changePasswordRef.current.close()}
      >
        <ChangePasswordForm onSubmit={() => changePasswordRef.current.close()} />
      </Modal>
    </div>

  );
};

export default AccountPage;
