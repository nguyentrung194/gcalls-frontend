import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from "react-router-dom";
import { MakingCall } from './components/making-call';
import { Home } from './components/home';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/call" element={<MakingCall />} />
      <Route
        path="/Home"
        element={<Navigate to="/" replace={true} />}
      />
      <Route path="/*" element={<Navigate to="/" replace={true} />} />
    </Routes>);
}

export default App;
