import "./App.css";
import { Header } from "./components/ui/Header";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home.page";
import { DashboardPage } from "./pages/dashboard.page";

function App() {
  return (
    <div className='w-full h-[100vh]'>
      <Header />
      <div className='w-[100%] flex justify-center'>
        <div className='w-[80%]'>
          <Router>
            <Routes>
              <Route
                path='/'
                element={<HomePage />}
              />
              <Route
                path='/dashboard'
                element={<DashboardPage />}
              />
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default App;
