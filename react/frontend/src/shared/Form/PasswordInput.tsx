import React, { ForwardedRef, ReactElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "../Icon";


interface PasswordInputProps {
  children: ReactElement[] | ReactElement,
}


const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((
  { children, ...props },
  ref: ForwardedRef<HTMLInputElement>
) => {

  const passwordRef = useRef(null);
  const [passwordHidden, setPasswordHidden] = useState(true);
  useImperativeHandle(ref, () => passwordRef.current, []);

  const toggleVisibility = () => {
    if (passwordRef.current.type == "password") {
      setPasswordHidden(false);
      passwordRef.current.type = "text";
    } else {
      setPasswordHidden(true);
      passwordRef.current.type = "password";
    }
  }

  return (
    <label htmlFor="password" className="block text-sm font-medium text-gray-600">
      Password
      <div className="relative">
        <input
          {...props}
          ref={passwordRef}
          type="password"
        />
        <div
          onClick={() => toggleVisibility()}
          className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 w-4"
        >
          {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </div>
      </div>

      {children}
    </label>

  );
});

export default PasswordInput;
