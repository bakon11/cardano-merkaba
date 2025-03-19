import { useState } from "react";
import { createStore } from "reusable";

export const useAIEndpoint = createStore( () => {
  // tslint:disable-next-line: react-hooks-nesting
  const [ useAIEndpoint, setUseAIEndpoint ] = useState(localStorage.getItem("useAIEndpoint"));
  // tslint:disable-next-line: no-shadowed-variable
  const handleSetAIEndPoint = async (useAIEndpoint: any) => {
    localStorage.setItem("useAIEndpoint", useAIEndpoint);
    return setUseAIEndpoint(useAIEndpoint);
  };
  return [useAIEndpoint, handleSetAIEndPoint];
});
