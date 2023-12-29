import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import React from "react";

export function RequireAuth({ children }: { children: JSX.Element| JSX.Element[] }) {
  let { user } = useAuth();
  let location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  } else {
    return children;
  }
}
