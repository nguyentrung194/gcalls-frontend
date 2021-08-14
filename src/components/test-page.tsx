import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import JsSIP from 'jssip';
import { useToasts } from 'react-toast-notifications';
import { VisitorContext } from '../contexts/visitor-context';
import environment from '../config';

export const TestPage = () => {
  const { curCall, cur, addVisitor } = useContext(VisitorContext);
  const { addToast } = useToasts();
  const [optKey, setOptKey] = useState({ count: 0, num: '', fn: {} as any });
  const socket = new JsSIP.WebSocketInterface('wss://sbc03.tel4vn.com:7444');
  const configuration = {
    sockets: [socket],
    uri: '109@2-test1.gcalls.vn:50061',
    password: 'test1109',
    session_timers: false,
    register: true,
  };
  const ua = new JsSIP.UA(configuration);
  ua.start();
  let audio: any;

  ua.on('newRTCSession', function (data: any) {
    console.log(data);
    if (data.session.direction === 'incoming') {
      curCall({
        session: data.session,
        name: data.session.remote_identity.display_name,
        phone: data.session.remote_identity.uri.user + '@' + data.session.remote_identity.uri.host,
        isReceivingCall: true,
      });
      data.session.on('accepted', function () {
        console.log('accepted');
        console.log(data);
        curCall({
          isAccepted: true,
        });
      });
      data.session.on('ended', function (e: any) {
        console.log('end');
        audio?.remove();
        addVisitor({
          from: environment.user2,
          name: data.session.remote_identity.display_name || '',
          phoneNumber:
            data.session.remote_identity.uri.user + '@' + data.session.remote_identity.uri.host,
          duration: data.session.end_time.getTime() - data.session.start_time.getTime(),
          event: e.cause,
          date: Date.now() + 60 * 60 * 7 * 1000,
          originator: e.originator,
          isOne: true,
        });
        curCall({
          isReceivingCall: false,
          session: {} as any,
          name: '',
          isAccepted: false,
        });
        console.log(e);
      });
      data.session.on('failed', function (e: any) {
        console.log('failed');
        audio?.remove();
        addVisitor({
          from: environment.user2,
          name: data.session.remote_identity.display_name || '',
          phoneNumber:
            data.session.remote_identity.uri.user + '@' + data.session.remote_identity.uri.host,
          duration: 0,
          event: e.cause,
          date: Date.now() + 60 * 60 * 7 * 1000,
          originator: e.originator,
          isOne: true,
        });
        curCall({
          isReceivingCall: false,
          session: {} as any,
          name: '',
          isAccepted: false,
        });
      });
      data.session.on('addstream', function (e: any) {
        audio = document.createElement('audio');
        audio.srcObject = e.stream;
        audio.play();
      });
    }
  });

  const formik = useFormik({
    initialValues: {
      phoneNumber: '',
    },
    onSubmit: async (values: any) => {
      try {
        const session = ua.call(values.phoneNumber, {
          eventHandlers: {
            progress: function (e: any) {
              console.log(e);
              console.log('call is in progress');
              formik.setSubmitting(true);
              curCall({
                phone: formik.values.phoneNumber,
                name: e.response.to.uri.user || '',
                session: session,
                isMakingCall: true,
              });
            },
            failed: function (e) {
              console.log(e);
              formik.setSubmitting(false);
              if (e.originator === 'local' && cur.isAccepted) {
                addToast('Local network error', {
                  appearance: 'error',
                  autoDismiss: true,
                });
              } else if (e.originator === 'system') {
                addToast('System occur error', {
                  appearance: 'info',
                  autoDismiss: true,
                });
              } else if (e.originator === 'remote') {
                switch (e.cause) {
                  case JsSIP.C.causes.BUSY:
                    addToast(`${cur.name || formik.values.phoneNumber} đang bận!`, {
                      appearance: 'info',
                      autoDismiss: true,
                    });
                    break;
                  case JsSIP.C.causes.REDIRECTED:
                    addToast(`${cur.name || formik.values.phoneNumber} đã từ chối kết nối`, {
                      appearance: 'info',
                      autoDismiss: true,
                    });
                    break;
                  case JsSIP.C.causes.NOT_FOUND:
                    addToast(`${formik.values.phoneNumber} là số không đúng`, {
                      appearance: 'info',
                      autoDismiss: true,
                    });
                    break;
                  case JsSIP.C.causes.CANCELED:
                    addToast(`${cur.name || formik.values.phoneNumber} đã hủy kết nối`, {
                      appearance: 'info',
                      autoDismiss: true,
                    });
                    break;
                  case JsSIP.C.causes.UNAVAILABLE:
                    addToast(`${cur.name || formik.values.phoneNumber} hiện không nghe máy`, {
                      appearance: 'info',
                      autoDismiss: true,
                    });
                    break;
                  default:
                    break;
                }
              }
              addVisitor({
                from: environment.user2,
                name: cur.name || '',
                phoneNumber: formik.values.phoneNumber,
                duration: 0,
                event: e.cause,
                date: Date.now() + 60 * 60 * 7 * 1000,
                originator: e.originator,
                isOne: true,
              });
              curCall({
                isMakingCall: false,
                session: {} as any,
                name: '',
                isAccepted: false,
              });
              audio?.remove();
            },

            ended: function (e) {
              console.log(e);
              console.log(cur);
              addVisitor({
                from: environment.user2,
                name: cur.name || '',
                phoneNumber: formik.values.phoneNumber,
                duration: session.end_time.getTime() - session.start_time.getTime(),
                event: e.cause,
                date: Date.now() + 60 * 60 * 7 * 1000,
                originator: e.originator,
                isOne: true,
              });
              curCall({
                isMakingCall: false,
                session: {} as any,
                name: '',
                isAccepted: false,
              });
              formik.setSubmitting(false);
              audio?.remove();
            },
            confirmed: function () {
              formik.setSubmitting(true);
              curCall({
                isAccepted: true,
              });
            },
          },
          mediaConstraints: { audio: true, video: false },
        });
        if (session) {
          session.connection.addEventListener('addstream', (e: any) => {
            audio = document.createElement('audio');
            audio.srcObject = e.stream;
            audio.play();
          });
        }
        formik.setSubmitting(false);
      } catch (error) {
        console.log(error);
        formik.setSubmitting(false);
      }
    },
  });

  let myVar: any;
  return (
    <div className="h-full min-h-screen bg-green-300">
      <div className="px-3 flex justify-center items-center">
        <form
          className={`w-full flex justify-between items-center flex-col h-full min-h-screen ${
            !(cur.isMakingCall || cur.isReceivingCall) ? 'opacity-100' : 'hidden h-0 opacity-0'
          }`}
          onSubmit={formik.handleSubmit}
        >
          <div className="pb-2 bg-transparent flex border-b-2 border-green-500 w-64 pt-10">
            <input
              className="tracking-widest w-full bg-transparent 
              outline-none text-xl pointer-events-none sm:pointer-events-auto text-left"
              required
              name="phoneNumber"
              type="text"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
            />
          </div>
          <div className="my-8">
            <div className="grid grid-cols-3 text-center gap-1 bg-green-100 p-1 rounded-md">
              {[
                { num: 1, label: ['_', ',', '@'] },
                { num: 2, label: ['a', 'b', 'c'] },
                { num: 3, label: ['d', 'e', 'f'] },
                { num: 4, label: ['g', 'h', 'i'] },
                { num: 5, label: ['j', 'k', 'l'] },
                { num: 6, label: ['m', 'n', 'o'] },
                { num: 7, label: ['p', 'q', 'r', 's'] },
                { num: 8, label: ['t', 'u', 'v'] },
                { num: 9, label: ['w', 'x', 'y', 'z'] },
                { num: '*', label: [] },
                { num: 0, label: [] },
                { num: '#', label: [] },
              ].map(({ num: number, label }: { num: any; label: string[] }, id) => {
                return (
                  <div key={number}>
                    <button
                      type="button"
                      onClick={() => {
                        setOptKey({ ...optKey, count: optKey.count + 1 });
                        clearTimeout(optKey.fn);
                        const timeOut = setTimeout(() => {
                          setOptKey({ ...optKey, count: 1, num: '' });
                        }, 1000);
                        setOptKey({ ...optKey, fn: timeOut });
                        if (label.length && optKey.count === label.length + 1) {
                          setOptKey({ ...optKey, count: 1, num: number });
                          formik.setFieldValue(
                            'phoneNumber',
                            formik.values.phoneNumber.slice(0, -1) + number,
                          );
                        } else if (optKey.num === number && label.length) {
                          formik.setFieldValue(
                            'phoneNumber',
                            formik.values.phoneNumber.slice(0, -1) + label[optKey.count - 1],
                          );
                        } else {
                          setOptKey({ ...optKey, count: 1, num: number });
                          formik.setFieldValue('phoneNumber', formik.values.phoneNumber + number);
                        }
                      }}
                      className="w-full px-2 py-4 text-xl bg-green-300 md:hover:bg-blue-400 
                    active:bg-blue-200 rounded-md text-green-700 md:hover:text-white outline-none"
                    >
                      {number + ' '}
                      {label.map((el, idx) => {
                        return (
                          <label key={'label' + number + '-' + idx} className="text-xs">
                            {' ' + el}
                          </label>
                        );
                      })}
                    </button>
                  </div>
                );
              })}
              <div className="col-span-3">
                <button
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('phoneNumber', formik.values.phoneNumber.slice(0, -1));
                  }}
                  onMouseDown={() => {
                    myVar = setTimeout(function () {
                      formik.setFieldValue('phoneNumber', '');
                    }, 500);
                  }}
                  onMouseUp={() => {
                    clearTimeout(myVar);
                  }}
                  onTouchStart={() => {
                    myVar = setTimeout(function () {
                      formik.setFieldValue('phoneNumber', '');
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    clearTimeout(myVar);
                  }}
                  className="w-full px-2 py-4 text-xl bg-green-300 md:hover:bg-blue-400 
                  active:bg-blue-200 rounded-md text-green-700 md:hover:text-white outline-none"
                >
                  backspace
                </button>
              </div>
            </div>
          </div>
          <div className="pb-8 w-64">
            <button
              className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-blue-400 h-12 w-full disabled:opacity-50
            hover:bg-blue-700 active:bg-blue-300 shadow-xl"
              disabled={formik.isSubmitting}
              type="submit"
            >
              Call
            </button>
          </div>
        </form>
        <div
          className={`flex flex-col justify-between items-center h-full min-h-screen text-center 
           w-64 pt-10 ${cur.isMakingCall ? 'opacity-100' : 'hidden opacity-0 h-0'}`}
        >
          <div className="flex justify-between flex-col h-56">
            <p className="text-xl">{cur.name || cur.phone}</p>
            <p className="text-sm">Gcalls</p>
            <p className="text-base">{!cur.isAccepted ? 'Đang kết nối' : 'Đang gọi'}</p>
          </div>
          <div>chuc nang</div>
          <div className="pb-8 w-full">
            <button
              className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-red-400 w-full h-12 disabled:opacity-50
            hover:bg-red-700 active:bg-red-300 shadow-xl"
              disabled={!formik.isSubmitting}
              type="button"
              onClick={() => {
                console.log(cur);
                if (cur.session) {
                  cur.session.terminate();
                  curCall({
                    isMakingCall: false,
                    isReceivingCall: false,
                    isAccepted: false,
                  });
                }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        <div
          className={`flex flex-col justify-between items-center h-full min-h-screen text-center 
           w-64 pt-10 ${cur.isReceivingCall ? 'opacity-100' : 'hidden opacity-0 h-0'}`}
        >
          <div className="flex justify-between flex-col h-56">
            <p className="text-xl">{cur.name || cur.phone}</p>
            <p className="text-sm">Gcalls</p>
            <p className="text-base">{!cur.isAccepted ? 'Đang gọi' : 'Đang nghe'}</p>
          </div>
          <div>chuc nang</div>

          <div className="w-full">
            <button
              className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-red-400 w-full h-12 
            hover:bg-red-700 active:bg-red-300 shadow-xl"
              type="button"
              onClick={() => {
                cur.session?.terminate();
                curCall({
                  isMakingCall: false,
                  isReceivingCall: false,
                  isAccepted: false,
                });
              }}
            >
              Cancel
            </button>
          </div>
          {cur.isReceivingCall ? (
            <div className="pb-8 w-full">
              <button
                className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
                 delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
                 text-center no-underline text-white bg-blue-400 h-12 w-full disabled:opacity-50
                 hover:bg-blue-700 active:bg-blue-300 shadow-xl"
                type="button"
                onClick={() => {
                  curCall({
                    isAccepted: true,
                  });
                  try {
                    cur.session.answer({
                      mediaConstraints: {
                        audio: true,
                        video: false,
                      },
                      rtcOfferConstraints: {
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: false,
                      },
                    });
                  } catch (error) {
                    addToast(`Bạn lỡ cuộc gọi từ ${cur.name}`, {
                      appearance: 'error',
                      autoDismiss: true,
                    });
                    audio?.remove();
                    curCall({
                      session: {} as any,
                      isAccepted: false,
                    });
                  }
                }}
              >
                Receive
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
