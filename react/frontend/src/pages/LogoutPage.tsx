import React, { useContext, useEffect } from "react";
import { useStore } from "../store";
import MainPagePreAuth from "./MainPagePreAuth";
import AuthContext from "../contexts/AuthContext";

const LogoutPage = () => {
  const { logoutUser } = useContext(AuthContext);
  let { reset } = useStore();
  useEffect(() => {
    logoutUser.mutate();
    reset();
  }, [])

  return <MainPagePreAuth />
}

export default LogoutPage;
