import React from "react";
import { ScrollUpButton } from "../shared/Form";
import { NavigationLink } from "../shared/NavigationLink";
import { Link } from "react-router-dom";
import { useStore } from "../store";

export const Footer: React.FC = () => {

  const { user } = useStore();

  function scrollToTop() {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div id="FooterWrapper" className="bg-white-50 bg-opacity-50 relative">
      <div className="flex flex-col md:flex-row items-center justify-between p-4">
        <p className="text-lg">
          While this tool and website covers a range of financial and legal topics, we cannot address every possible question or situation. Nothing can replace personal, professional guidance from a lawyer or financial planner about your unique situation. We have included some trusted links in the
          <Link className="link-primary !lowercase px-1" to={'/resources'}>
            Resources
          </Link>section to help you find that guidance even if you have limited income.
        </p>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <div
            tabIndex={0}
            className="text-primary hover:text-primary_alt focus:text-primary_alt flex" onClick={scrollToTop}>
            <p className="text-lg font-semibold link-primary m-auto pr-2">Scroll to Top</p>
            <ScrollUpButton handleClick={scrollToTop}/>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0">
          <Link to="/" className="flex underline-none">
            <div className="text-5xl font-semibold text-primary_alt pb-14">START Planning</div>
          </Link>
          <div className="text-left">
            <div className="font-semibold text-xl flex gap-8">
              <div className="md:flex md:flex-col">
                <NavigationLink href="/videos" label="Videos" />
                <NavigationLink href="/glossary" label="Glossary" />
                <NavigationLink href="/my-notes" label="Team Notes" />
              </div>

              <div className="md:flex md:flex-col">
                <NavigationLink href="/todos" label="To Do" />
                <NavigationLink href="/resources" label="Resources" />
                <NavigationLink href="/how-it-works" label="How It Works" />
              </div>

              <div className="md:flex md:flex-col">
                <NavigationLink href="/about" label="About" />
                <NavigationLink href="/my-portal" label="Account" />
              </div>
            </div>
          </div>
          <div className="">
            <div className="flex flex-col md:flex-row items-center justify-end mt-auto">
              <p className="lg:text-xl md:text-xl sm:text-lg font-bold mr-4 text-right">
                Plan today. Peace of mind tomorrow.
              </p>
            </div>

            {user ? (<></>)
              :
              (
                <div className="flex text-white-1 gap-3">
                  <button className="bg-primary hover:bg-primary_alt rounded py-2 px-4" >Sign Up</button>
                  <Link to="/login" className="bg-primary hover:bg-primary_alt rounded py-2 px-4">
                    Log In
                  </Link>
                </div>
              )
            }
          </div >
        </div >
      </div >
    </div>
  );
};
