import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/auth";
import React, { createContext, useState} from "react";
import {jwtDecode} from 'jwt-decode'
import humps from "humps";

const AuthContext = createContext(null);

export const AuthProvider = ({children}: any) => {
    const [auth, setAuth] = useState(() => localStorage.getItem('authToken') ? localStorage.getItem('authToken') : null)
    const [user, setUser] = useState<any>(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSettled: (data) => {
            setAuth(data.access);
            const tmpUser = humps.camelizeKeys(jwtDecode(data.access))
            setUser(tmpUser);
            localStorage.setItem('user', JSON.stringify(tmpUser));
            localStorage.setItem('authToken', data.access);
        },
    })

    let logoutUser = () => {
        setAuth(null);
        setUser(null);
        localStorage.removeItem('authToken');
    }

    let contextData = {
        user: user,
        auth: auth,
        setAuth: setAuth,
        setUser: setUser,
        loginUser: loginMutation,
        logoutUser: logoutUser,
        fullName: () => {
            return `${user?.firstName} ${user?.lastName}`
        },
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthContext;
