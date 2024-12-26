import { useState } from 'react'
import { createStore } from 'reusable'

export const menuHook = createStore(() => useState('MainHomeView'))

/*
export const userLoginHook = createStore( () => {
  // tslint:disable-next-line: react-hooks-nesting
  const [ user, setUser ] = useState(sessionStorage.getItem("user"));
  // tslint:disable-next-line: no-shadowed-variable
  const handleSetUser = async (user: any) => {
    sessionStorage.setItem("user", user);
    return setUser(user);
  };
  return [user, handleSetUser];
});
*/
