
import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import {NavigationDropDown, NavigationLink} from "../shared/NavigationLink";
import { ChangeFontSize } from '../shared/Icon';

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
          <div className="text-4xl font-semibold">START Planning</div>
        </Link>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          className="flex items-center px-3 py-2 border rounded text-teal-500 border-teal-500 hover:text-white hover:border-white">
          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
        </button>
      </div>
      {(isMenuOpen || width >= lg) && (
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="lg:flex text-xl lg:flex-grow lg:space-x-6 lg:justify-end lg:align-middle ">
          <NavigationLink href="/videos" label="Learn" />
          <NavigationLink href="/to-do" label="To Do" />
          <NavigationLink href="/my-notes" label="My Notes" />
          <NavigationDropDown label="Resources">
            <NavigationLink href="/glossary" label="Glossary" />
            <></>
          </NavigationDropDown>
          <NavigationDropDown label="About">
            <NavigationLink href="/partners" label="Partners" />
            <></>
          </NavigationDropDown>
          <button className="w-5">
            <ChangeFontSize/>
          </button>
        </div>
      </div>
      )}
    </nav>
  );
};

export default Navigation
