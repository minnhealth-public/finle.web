import React from "react";
import { Link } from "react-router-dom";

const PleaseCreateTeam = () => {
  return (
    <p>
      To access this feature you first have to create a team. Please go to your <Link className="link-primary !text-sm" to="/account">account</Link> and create a team to use this functionality.
    </p>
  )
}

export default PleaseCreateTeam;
