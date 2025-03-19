import { useState } from "react";
import { createStore } from "reusable";

export const useModel = createStore( () => {
  // tslint:disable-next-line: react-hooks-nesting
  const [ useModel, setUseModel ] = useState(localStorage.getItem("useModel"));
  // tslint:disable-next-line: no-shadowed-variable
  const handleSetUseModel = async (useModel: any) => {
    localStorage.setItem("useModel", useModel);
    return setUseModel(useModel);
  };
  return [useModel, handleSetUseModel];
});
