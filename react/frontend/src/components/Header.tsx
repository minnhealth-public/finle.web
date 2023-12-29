import React  from 'react'
import { SearchInput } from '../shared/Form';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import HeaderAuth from './HeaderAuth';

const Header: React.FC = () => {

  let {user} = useAuth();

  return (
    <header className="bg-grey-650 text-white text-center ">
      <div className="container p-4 mx-auto flex flex-row-reverse">
        <div className="flex justify-end gap-3 text-white-1 ">
          <SearchInput searchParamName='search' ></SearchInput>

          {user?(<HeaderAuth></HeaderAuth>)
          :
          (
            <>
          <button className=" bg-white-1 hover:bg-green-550 text-black py-2 px-4 rounded">
            Sign Up
          </button>
          <Link to="/login" className="bg-white-1 hover:bg-green-550 text-black py-2 px-4 rounded">
            Login
          </Link>
            </>
          )
          }
        </div>
      </div>
    </header>
  );
}

export default Header
