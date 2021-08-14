import axios from 'axios';
import environment from '../config';

export const VisitorReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'ADD_VISITOR':
      state.visitors.push({
        ...action.payload,
      });
      axios({
        method: 'POST',
        url: `${environment.api}/call-logs`,
        data: {
          ...action.payload,
        },
      });
      return {
        ...state,
        visitors: [...state.visitors],
      };
    case 'REMOVE_VISITOR':
      axios.delete(`${environment.api}/call-logs`, {
        params: {
          _id: action.payload._id,
        },
      });
      return {
        ...state,
        visitors: [...state.visitors.filter((item: any) => item._id !== action.payload._id)],
      };
    case 'REMOVE_ALL_VISITORS':
      axios.delete(`${environment.api}/call-logs`);
      return {
        ...state,
        visitors: [],
      };
    case 'CUR_CALL':
      return {
        ...state,
        cur: {
          ...state.cur,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
