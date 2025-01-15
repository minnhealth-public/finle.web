
import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { NavigationDropDown, NavigationLink } from "../shared/NavigationLink";
import ChangeFontSize from '../shared/View/ChangeFontSize';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [width, setWidth] = React.useState(window.innerWidth);
  const lg = 1025;
  React.useEffect(() => {
    const handleResizeWindow = () => setWidth(window.innerWidth);
    // subscribe to window resize event "onComponentDidMount"
    window.addEventListener("resize", handleResizeWindow);
    return () => {
      // unsubscribe "onComponentDestroy"
      window.removeEventListener("resize", handleResizeWindow);
    };
  }, []);

  return (
    <nav className="container flex justify-between mx-auto items-center flex-wrap p-4 bg-white-1 text-grey-650">
      <div className="flex items-center flex-shrink-0 ">
        <Link to="/" className="flex items-center underline-none">
          <div className="md:text-4xl font-semibold text-primary capitalize">START Planning</div>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          className="flex items-center px-3 py-2 border rounded text-primary_alt border-primary_alt hover:text-white hover:border-white">
          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
        </button>
      </div>
      {(isMenuOpen || width >= lg) && (
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto text-sky-970">
          <div className="lg:flex text-2xl lg:flex-grow lg:space-x-6 lg:justify-end lg:align-middle font-semibold">
            <NavigationLink href="/videos" label="Videos" id="videos-nav" />
            <NavigationLink href="/todos" label="To Do" id="todo-nav" />
            <NavigationDropDown label="Tools" id="tools-nav">
              <div className="text-xl flex flex-col gap-2">
                <NavigationLink href="/glossary" label="Glossary" id="glossary-nav"/>
                <NavigationLink href="/resources" label="Resources" id="resources-nav" />
                <NavigationLink href="/my-notes" label="Team Notes" id="notes-nav" />
              </div>
            </NavigationDropDown>
            <NavigationLink href="/how-it-works" label="How It Works" id="howitworks-nav" />
            <NavigationLink href="/about" label="About" id="about-nav" />
            <ChangeFontSize />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation
