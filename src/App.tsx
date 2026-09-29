import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LiveStreamProvider } from "./context/LiveStreamContext";
import { initSupabaseSync } from "./lib/supabaseSync";
import { initMindsetShiftSync } from "./lib/mindsetShiftSync";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Academy from "./pages/Academy";
import Tribe from "./pages/Tribe";
import Agency from "./pages/Agency";
import AIPage from "./pages/AIPage";
import Blog from "./pages/Blog";
import About from "./pages/About";
import PartnerPage from "./pages/PartnerPage";
import Leaderboard from "./pages/Leaderboard";
import Verify from "./pages/Verify";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AttendanceReview from "./pages/AttendanceReview";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import LivePage from "./pages/LivePage";
import Gallery from "./pages/Gallery";
import RegisterPage from "./pages/RegisterPage";
import SignInPage from "./pages/SignInPage";
import WaitlistPage from "./pages/WaitlistPage";
import MessagesPage from "./pages/MessagesPage";
import MindsetShiftPage from "./pages/MindsetShiftPage";

export default function App() {
  useEffect(() => {
    initSupabaseSync();
    initMindsetShiftSync();
  }, []);

  return (
    <AuthProvider>
      <LiveStreamProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tribe" element={<Tribe />} />
              <Route path="/agency" element={<Agency />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/mindset-shift" element={<MindsetShiftPage />} />
              <Route path="/partner" element={<PartnerPage />} />
              <Route path="/partner-with-us" element={<PartnerPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/attendance-review" element={<AttendanceReview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
              {/* Branded 404 for unknown routes (keeps Navbar/Footer brand surface) */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LiveStreamProvider>
    </AuthProvider>
  );
}
