import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MakingCall } from './components/making-call';
import { TestPage } from './components/test-page';
import { Log } from './components/log';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MakingCall />} />
      <Route path="/users/:from" element={<Log />} />
      <Route path="/users" element={<Log />} />
      <Route path="/test-page" element={<TestPage />} />
      <Route path="/*" element={<Navigate to="/" replace={true} />} />
    </Routes>
  );
}

export default App;
