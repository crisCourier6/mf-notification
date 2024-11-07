import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import UserNotifications from "./components/UserNotifications";



function App() {
  return (
    <div className="App">
      <Router basename="/mf-notification">
          <Routes>
              <Route path="/profile" element={<UserNotifications isAppBarVisible={false} />}/>
          </Routes>
        
      </Router>
    </div>
  );
}

export default App;