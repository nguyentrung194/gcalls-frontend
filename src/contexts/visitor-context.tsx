import axios from 'axios';
import React, { createContext, useReducer } from 'react';
import environment from '../config';
import { VisitorReducer } from './visitor-reducer';

export const VisitorContext = createContext<any>(null);

async function getCallLog() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${environment.api}/call-logs`,
    });
    initialState.visitors = response.data.data;
  } catch (error) {
    console.error(error);
  }
}

const initialState = {
  visitors: [],
  cur: {
    isMakingCall: false,
    isReceivingCall: false,
    name: '',
    isAccepted: false,
    session: null as any,
    phone: '',
  },
};
getCallLog();

console.log(initialState);

const VisitorContextProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(VisitorReducer, initialState);

  const addVisitor = (payload: any) => {
    dispatch({ type: 'ADD_VISITOR', payload });
  };

  const removeVisitor = (payload: any) => {
    dispatch({ type: 'REMOVE_VISITOR', payload });
  };

  const removeVisitors = (payload: any) => {
    dispatch({ type: 'REMOVE_ALL_VISITORS', payload });
  };
  const curCall = (payload: any) => {
    dispatch({ type: 'CUR_CALL', payload });
  };

  const contextValues = {
    addVisitor,
    removeVisitor,
    removeVisitors,
    curCall,
    ...state,
  };

  return <VisitorContext.Provider value={contextValues}>{children}</VisitorContext.Provider>;
};

export default VisitorContextProvider;
