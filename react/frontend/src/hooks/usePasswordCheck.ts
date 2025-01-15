import React from "react";
const usePasswordCheck = () => {

  const checkPassword = (password: string) => {
    // Define the regular expressions for the character requirements

    // TODO this is only the focus group
    return true;

    const uppercaseRegExp = /[A-Z]/;
    const lowercaseRegExp = /[a-z]/;
    const digitRegExp = /[0-9]/;
    const specialCharRegExp = /[!@#\$%\^&\*\(\)_\+\-\=\[\]\{\};:'",<>\.\?\/`~]/;
    let errorString = "";

    // Check password length
    if (password.length < 12 || password.length > 64) {
      errorString += "<li>Must be between 12 and 64 characters long.</li>"
    }

    // Check for at least one uppercase letter
    if (!uppercaseRegExp.test(password)) {
      errorString += "<li>Must include at least one uppercase letter(A - Z).</li>"
    }

    // Check for at least one lowercase letter
    if (!lowercaseRegExp.test(password)) {
      errorString += "<li>Must include at least one lowercase letter(a - z).</li>"
    }

    // Check for at least one digit
    if (!digitRegExp.test(password)) {
      errorString += "<li>Must include at least one digit(0 - 9).</li>"
    }

    // Check for at least one special character
    if (!specialCharRegExp.test(password)) {
      errorString += "<li>Must include at least one special character(e.g., ! @ # $ % ^ & * ( ) _ + - =[] {} ; : ' \" , < > . ? / \` ~).</li>"
    }

    if (errorString !== "") {
      return `<ul>${errorString}</ul>`
    }

    // If all checks pass
    return true;
  }

  return {
    checkPassword,
  };
}

export default usePasswordCheck;
