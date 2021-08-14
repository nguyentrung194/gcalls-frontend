import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import environment from '../config';

export const Log = () => {
  const { from } = useParams();
  const [callLog, setCallLog] = useState([]);
  const getCallLog = (from: string) => {
    if (from) {
      const rq1 = axios({
        method: 'GET',
        url: `${environment.api}/call-logs`,
        params: {
          from: from,
        },
      });
      const rq2 = axios({
        method: 'GET',
        url: `${environment.api}/call-logs`,
        params: {
          numberPhone: from,
        },
      });
      axios.all([rq1, rq2]).then(
        axios.spread((...responses) => {
          const callLog: any = [...responses[0].data.data, ...responses[1].data.data];
          setCallLog(callLog);
          console.log(callLog);
        }),
      );
    } else {
      axios({ method: 'GET', url: `${environment.api}/call-logs` }).then((res) => {
        setCallLog(res.data.data);
      });
    }
  };
  useEffect(() => getCallLog(from), [from]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 p-4 bg-blue-100 min-h-screen">
      {callLog &&
        callLog.map((el: any, id: any) => {
          return (
            <div key={id} className="bg-white p-2 grid grid-cols-1 gap-4 h-full">
              <div>
                <p className="text-gray-500">
                  <span className="text-lg text-black">{el.from.slice(0, 10)}</span>
                  {`${el.from === from ? ' đã gọi cho ' : ' đã nhận cuộc gọi từ '}`}
                  <span className="text-lg text-black">
                    {el.name ? `người dùng ${el.name}` : `số điện thoại ${el.phoneNumber}`}
                  </span>
                </p>
                <p className="text-gray-500">
                  <span className="text-black">Vào lúc:</span> {el.date}
                </p>
                {el.duration ? <p>Thời lượng: {el.duration}</p> : null}
                <p className="text-black">
                  Trạng thái: {el.event} <span className="text-gray-500">từ</span>{' '}
                  {el.originator === 'local'
                    ? from
                    : el.name
                    ? `người dùng ${el.name}`
                    : `số điện thoại ${el.phoneNumber}`}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
};
