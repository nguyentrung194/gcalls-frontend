import { useFormik } from "formik";
import React from "react";
import "./App.css";
import JsSIP from "jssip";

function App() {
  const socket = new JsSIP.WebSocketInterface("wss://sbc03.tel4vn.com:7444");
  const configuration = {
    sockets: [socket],
    uri: "107@2-test1.gcalls.vn:50061",
    password: "test1107",
    session_timers: false,
  };

  const ua = new JsSIP.UA(configuration);

  // Register callbacks to desired call events
  const eventHandlers = {
    progress: function (e: any) {
      console.log("call is in progress");
    },
    failed: function (e: any) {
      // console.log("call failed with cause: " + e.data.cause);
      console.log(e);
      console.log(1);
    },
    ended: function (e: any) {
      // console.log("call ended with cause: " + e.data.cause);
      console.log(e);
    },
    confirmed: function (e: any) {
      console.log("call confirmed");
      console.log(e);
    },
  };

  const options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true, video: true },
  };

  const formik: any = useFormik({
    initialValues: {
      phoneNumber: "",
    },
    onSubmit: async (values: any) => {
      try {
        formik.setSubmitting(true);
        ua.start();
        const session = ua.call(values.phoneNumber, options);
        if (session) {
          session.connection.addEventListener("addstream", (e: any) => {
            var audio = document.createElement("audio");
            audio.srcObject = e.stream;
            audio.play();
          });
        }
        // send data
        if (1) {
          // check dk
          //  console data
        } else {
          // console error from server
        }
        formik.setSubmitting(false);
      } catch (error) {
        console.log(error);
        // console error
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
            formik.setFieldValue(
              "phoneNumber",
              formik.values.phoneNumber + number
            );
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
    <div className="flex justify-center items-center h-full min-h-screen bg-green-300">
      <div className="m-3">
        <form className="w-full">
          <div className="pb-2 bg-transparent flex border-b-2 border-green-500">
            <input
              className="w-full bg-transparent outline-none text-xl"
              required
              name="phoneNumber"
              type="text"
              value={formik.values.phoneNumber}
            />
            <button
              type="button"
              className="px-3"
              onClick={() => {
                formik.setFieldValue(
                  "phoneNumber",
                  formik.values.phoneNumber.slice(0, -1)
                );
              }}
              onMouseDown={() => {
                myVar = setTimeout(function () {
                  formik.setFieldValue("phoneNumber", "");
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
              <ButtonNumber number={"*"} />
              <ButtonNumber number={0} />
              <ButtonNumber number={"#"} />
            </div>
          </div>
          <button
            className="py-6 my-2 text-lg font-bold cursor-pointer transition-all duration-300 
            delay-75 rounded-full appearance-none flex items-center justify-center flex-shrink-0
            text-center no-underline text-white bg-blue-400 h-12 w-full disabled:opacity-50
            hover:bg-blue-700 active:bg-blue-300 shadow-xl"
            disabled={formik.isSubmitting}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit(e);
            }}
          >
            Call
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
