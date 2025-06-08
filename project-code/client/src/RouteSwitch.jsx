import {BrowserRouter, Routes, Route} from "react-router-dom";

import LoginPage from './pages/LoginPage';
import StudentHomePage from './pages/StudentHomePage';
import StaffHomePage from './pages/StaffHomePage';
import NewModulePage from './pages/NewModulePage';
import NewRequest from "./pages/NewRequets";
import StudentHistory from "./pages/StudentHistory";
import StaffDecisions from "./pages/StaffDecisionsPage";
import DecisionHistory from "./pages/DecisionHistoryPage";

const RouteSwitch = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/student-home-page" element={<StudentHomePage/>}/>
                <Route path="/staff-home-page" element={<StaffHomePage/>}/>
                <Route path="/new-module-page" element={<NewModulePage/>}/>
                <Route path="/edit-module-page" element={<NewModulePage/>}/>
                <Route path="/new-request-page" element={<NewRequest/>}/>
                <Route path="/student-history-page" element={<StudentHistory/>}/>
                <Route path="/student-history-page/:id" element={<StudentHistory/>}/>
                <Route path="/staff-decision-page" element={<StaffDecisions/>}/>
                <Route path="/decision-history-page" element={<DecisionHistory/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RouteSwitch;