import styled from "styled-components";
import "./App.css";
import { Nav, Navbar } from "rsuite";
import { RiDashboard2Line } from "react-icons/ri";
import { FaCogs, FaChartPie } from "react-icons/fa";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Overview from "./components/Overview";

function App() {
  let navigate = useNavigate();

  const move = (e: any, route: string) => {
    navigate(`/${route}`);
  };

  return (
    <AppWrapper>
      <Navbar>
        <Navbar.Brand>Bookee</Navbar.Brand>
        <Nav>
          <Nav.Item
            onSelect={(e) => move(e, "Dashboard")}
            icon={<RiDashboard2Line />}
          >
            {" "}
            Dashboard
          </Nav.Item>
          <Nav.Item
            onSelect={(e) => move(e, "Overview")}
            icon={<FaChartPie />}
          >
            {" "}
            Overview
          </Nav.Item>
        </Nav>
        <Nav pullRight>
          <Nav.Item onSelect={(e) => move(e, "Settings")} icon={<FaCogs />}>
            {" "}
            Settings
          </Nav.Item>
        </Nav>
      </Navbar>
      <ContentWrapper>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Overview" element={<Overview />} />
          <Route path="/Settings" element={<Settings />} />
        </Routes>
      </ContentWrapper>
    </AppWrapper>
  );
}

export default App;

const AppWrapper = styled.div``;
const ContentWrapper = styled.div`
  padding: 20px;
`;
