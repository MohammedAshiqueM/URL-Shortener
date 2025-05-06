import React, { createContext, useEffect, useState } from "react";
import {jwtDecode} from 'jwt-decode'

const AuthContext = createContext()

const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)

    useEffect(()=>{
        const storedAccess = localStorage.getItem('access')

        if(storedAccess){
            try{
                const decode = jwtDecode(storedAccess)
                setUser(decode)
                console.log("decode value",decode)
            }catch(error){
                console.error("invalid access token")
            }
        }

    },[])
    const login = ({access,refresh})=>{
        localStorage.setItem('access',access)
        localStorage.setItem('refresh',refresh)
        const decode = jwtDecode(access)
        setUser(decode)
    }
    const logout = ()=>{
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)

    }
    return(
        <AuthContext.Provider value={{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext

export {AuthProvider}