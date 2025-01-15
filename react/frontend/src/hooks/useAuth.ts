import { useContext, useDebugValue } from "react";
import AuthContext from "../contexts/AuthContext";

const useAuth = () => {
  const authCon = useContext(AuthContext);
  useDebugValue(authCon.auth, auth => auth?.user ? "Logged In" : "Logged Out")
  return authCon;
}

export default useAuth;
