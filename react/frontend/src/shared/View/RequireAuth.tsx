import React from "react";
import LoginForm from "../Form/LoginForm";
import { useStore } from "../../store";

// images
import section1 from '../../images/mainpage-section1.png';
import SSOLogins from "../../components/SSOLogins";

export function RequireAuth({ children }: { children: JSX.Element | JSX.Element[] }) {
  let { user } = useStore();

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="md:flex flex-row gap-5">
          <div className="md:basis-1/2">
            <img src={section1} alt="two women smiling" />
          </div>
          <div className="md:basis-1/2">
            <h1 className="text-7xl text-header pb-4">START Planning</h1>
            <p className="text-gray-600 mb-6">
              Welcome to <span className="font-semibold text-primary_alt">START Planning</span>. To access personalized care features, please sign in or create an account.
            </p>
            <div className="flex justify-between">
              <LoginForm></LoginForm>
              <div className="flex flex-col align-middle m-4">
                <div className="border-l flex-grow m-auto mb-2 "></div>
                <div className="text-s">or</div>
                <div className="border-l flex-grow m-auto mt-2"></div>
              </div>
              <div className="mt-1 p-4 ">
                <SSOLogins />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return children;
  }
}
