import React from 'react';
import { useFormik } from 'formik';
import JsSIP from 'jssip';
import axios from 'axios'

export const MakingCall = () => {
    const socket = new JsSIP.WebSocketInterface('wss://sbc03.tel4vn.com:7444');
    const configuration = {
        sockets: [socket],
        uri: '107@2-test1.gcalls.vn:50061',
        password: 'test1107',
        session_timers: false,
    };

    const ua = new JsSIP.UA(configuration);


    const formik = useFormik({
        initialValues: {
            phoneNumber: '',
            session: { terminate: () => { } },
            status: -1,
        },
        onSubmit: async (values: any) => {
            try {
                formik.setSubmitting(true);
                ua.start();
                const session = ua.call(values.phoneNumber, {
                    eventHandlers: {
                        progress: function (e: any) {
                            console.log('call is in progress');
                            formik.setSubmitting(true);
                            formik.setFieldValue('status', 1);
                        },
                        failed: function (e: any) {
                            console.log('call failed');
                            formik.setSubmitting(false);
                            formik.setFieldValue('status', 2);
                            setTimeout(() => {
                                formik.setFieldValue('status', -1);
                            }, 3000);
                        },
                        ended: function (e: any) {
                            console.log('call ended');
                            formik.setSubmitting(false);
                            formik.setFieldValue('status', 3);
                            setTimeout(() => {
                                formik.setFieldValue('status', -1);
                            }, 3000);
                            axios({
                                method: 'post',
                                url: 'http://localhost:8080/call-logs',
                                data: {
                                    phoneNumber: formik.values.phoneNumber,
                                    duration: 0,
                                    status: 3,
                                    date: Date.now()
                                }
                            });
                        },
                        confirmed: function (e: any) {
                            console.log('call confirmed');
                            formik.setSubmitting(true);
                            formik.setFieldValue('status', 4);
                        },

                    },
                    mediaConstraints: { audio: true, video: false },
                });
                formik.setFieldValue('session', session);
                if (session) {
                    session.connection.addEventListener('addstream', (e: any) => {
                        var audio = document.createElement('audio');
                        audio.srcObject = e.stream;
                        audio.play();
                    });
                }
            } catch (error) {
                console.log(error);
                formik.setSubmitting(false);
            }
        },
    });


    const ButtonNumber = ({ number }: any) => {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => {
                        formik.setFieldValue('phoneNumber', formik.values.phoneNumber + number);
                    }}
                    className="w-full px-2 py-4 text-xl hover:bg-blue-400 active:bg-blue-200 rounded-md
          text-green-700 hover:text-white"
                >
                    {number}
                </button>
            </div>
        );
    };
    let myVar: any;
    return (
        <div className="flex justify-center items-end h-full min-h-screen bg-green-300">
            <div className="m-3">
                <form className={`w-full ${formik.isSubmitting ? 'hidden h-0 opacity-0' : 'opacity-100'}`}>
                    <div className="pb-2 bg-transparent flex border-b-2 border-green-500">
                        <input
                            className="text-center tracking-widest w-full bg-transparent outline-none text-xl pointer-events-none"
                            required
                            name="phoneNumber"
                            type="text"
                            value={formik.values.phoneNumber}
                        />
                        <button
                            type="button"
                            className="px-3"
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
                        >
                            x
                        </button>
                    </div>
                    <div className="my-8">
                        <div className="grid grid-cols-3 text-center">
                            <ButtonNumber number={1} />
                            <ButtonNumber number={2} />
                            <ButtonNumber number={3} />
                            <ButtonNumber number={4} />
                            <ButtonNumber number={5} />
                            <ButtonNumber number={6} />
                            <ButtonNumber number={7} />
                            <ButtonNumber number={8} />
                            <ButtonNumber number={9} />
                            <ButtonNumber number={'*'} />
                            <ButtonNumber number={0} />
                            <ButtonNumber number={'#'} />
                        </div>
                    </div>
                    <button
                        className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-blue-400 h-12 w-full disabled:opacity-50
            hover:bg-blue-700 active:bg-blue-300 shadow-xl"
                        disabled={formik.isSubmitting}
                        type="submit"
                        onClick={(e: any) => {
                            e.preventDefault();
                            formik.handleSubmit(e);
                        }}
                    >
                        Call
                    </button>
                </form>
                <div
                    className={`grid grid-cols-1 gap-y-10 text-center min-w-full w-64 ${!formik.isSubmitting ? 'hidden opacity-0 h-0' : 'mt-0 opacity-100'
                        }`}
                >
                    <p>{formik.values.phoneNumber}</p>
                    <p>Gcalls</p>
                    <p>
                        {formik.values.status === 1
                            ? 'Đang gọi'
                            : formik.values.status === 2 || formik.values.status === 3
                                ? 'Kết thúc cuộc gọi'
                                : formik.values.status === 4
                                    ? `${'Đang nghe'}`
                                    : ''}
                    </p>
                    <button
                        className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-red-400 h-12 w-full disabled:opacity-50
            hover:bg-red-700 active:bg-red-300 shadow-xl"
                        disabled={!formik.isSubmitting}
                        type="button"
                        onClick={() => {
                            if (formik.values.session !== null) {
                                formik.values.session.terminate();
                            }
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}