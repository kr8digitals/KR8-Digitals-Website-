import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FollowPopup from "./FollowPopup";
import LiveStreamBanner from "./LiveStreamBanner";
import LiveStreamModal from "./LiveStreamModal";
import LiveStreamMiniPlayer from "./LiveStreamMiniPlayer";

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Site-wide live broadcast notification bar across all pages */}
      <LiveStreamBanner />

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <FollowPopup />

      {/* Interactive Live Stream Stage, Studio & Replay Player */}
      <LiveStreamModal />

      {/* Persistent Picture-in-Picture Mini-Player while browsing other pages */}
      <LiveStreamMiniPlayer />
    </div>
  );
}
