import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Welcome } from './components/Welcome';
import { Form } from './components/Form';
import { History } from './components/History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/form" element={<Form />} />
        <Route path="/history/:number" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App; 