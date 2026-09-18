import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Academy from "./pages/Academy";
import Tribe from "./pages/Tribe";
import Agency from "./pages/Agency";
import AIPage from "./pages/AIPage";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Leaderboard from "./pages/Leaderboard";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import AttendanceReview from "./pages/AttendanceReview";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tribe" element={<Tribe />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/about" element={<About />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/attendance-review" element={<AttendanceReview />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
