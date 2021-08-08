import React from 'react';
import JsSIP from 'jssip';

export const Home = () => {
    const socket = new JsSIP.WebSocketInterface('wss://sbc03.tel4vn.com:7444');
    const configuration = {
        sockets: [socket],
        uri: '108@2-test1.gcalls.vn:50061',
        password: 'test1108',
        session_timers: false,
    };
    const ua = new JsSIP.UA(configuration);
    ua.start();
    ua.on("registered", function () {
        console.log('register')
    });

    ua.on("newRTCSession", function (data: any) {
        var session = data.session;
        console.log('start')

        if (session.direction === "incoming") {
            // incoming call here
            console.log("incoming call here")
            session.on("accepted", function () {
                // the call has answered
            });
            session.on("confirmed", function () {
                // this handler will be called for incoming calls too
            });
            session.on("ended", function () {
                // the call has ended
            });
            session.on("failed", function () {
                // unable to establish the call
            });
            session.on('addstream', function (e: any) {
                // set remote audio stream (to listen to remote audio)
                // remoteAudio is <audio> element on page
                var audio = document.createElement('audio');
                audio.srcObject = e.stream;
                audio.play();
            });
            session.answer({ mediaConstraints: { audio: true, video: false }, });
            // Reject call (or hang up it)
            // session.terminate();
        }
    });

    return (
        <div className="flex justify-center items-end h-full min-h-screen bg-green-300">
            <div className="m-3">
                <div className="min-w-full w-64">
                    <button
                        className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
                        delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
                        text-center no-underline text-white bg-red-400 h-12 w-full disabled:opacity-50
                      hover:bg-red-700 active:bg-red-300 shadow-xl"
                        type="button"
                        onClick={() => { }}
                    >
                        Receive
                    </button>
                </div>
            </div>
        </div>
    );
};
