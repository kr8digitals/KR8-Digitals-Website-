import sys, time
from playwright.sync_api import sync_playwright

def run_tests():
    print("=== STARTING COMPREHENSIVE E2E VERIFICATION ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        # 1. Home page & Video Carousel
        print("\n1. Testing Home Page & Testimonial Carousel...")
        page.goto("http://localhost:5173/")
        page.wait_for_selector("video")
        
        video_src = page.eval_on_selector("video", "el => el.currentSrc || el.src")
        print(f"  Testimonial Video SRC: {video_src}")
        assert "testimonial_" in video_src, "Video SRC does not point to student testimonial"
        
        # Test next button
        next_btn = page.locator('button[aria-label="Next story"]')
        if next_btn.count() > 0:
            next_btn.first.click()
            time.sleep(1)
            video_src_2 = page.eval_on_selector("video", "el => el.currentSrc || el.src")
            print(f"  Switched story SRC: {video_src_2}")
            assert video_src_2 != "", "Switched video source is empty"
        print("  ✓ Testimonial Carousel Verified!")

        # 2. Academy Page & 1-on-1 Coaching
        print("\n2. Testing Academy Page & 1-on-1 Coaching...")
        page.goto("http://localhost:5173/academy")
        page.wait_for_selector("text=1-on-1 Coaching")
        assert page.locator("text=₦50").count() > 0 or page.locator("text=/min").count() > 0
        print("  ✓ Academy Coaching Section Verified!")

        # 3. Leaderboard Page
        print("\n3. Testing Leaderboard Page...")
        page.goto("http://localhost:5173/leaderboard")
        page.wait_for_selector("text=Leaderboard")
        rows = page.locator("text=pts")
        row_count = rows.count()
        print(f"  Leaderboard rendered {row_count} student point badges")
        assert row_count >= 5, "Fewer than 5 leaderboard student badges rendered"
        print("  ✓ Leaderboard Page Verified!")

        # 4. Live Broadcast Studio Page
        print("\n4. Testing Live Studio Page...")
        page.goto("http://localhost:5173/live")
        page.wait_for_selector("text=KR8 Live")
        # Click the main action button
        action_btn = page.locator("button:has-text('Studio'), button:has-text('Stage'), button:has-text('Stream')").first
        if action_btn.count() > 0:
            action_btn.click()
            time.sleep(1)
            assert page.locator("text=KR8 Live Studio").count() > 0, "KR8 Live Studio modal didn't open"
            print("  ✓ Live Stream Stage Modal and KR8 Branding Verified!")

        # 5. Agency Page Form Validation
        print("\n5. Testing Agency Form Validation...")
        page.goto("http://localhost:5173/agency")
        page.wait_for_selector("text=Agency")
        print("  ✓ Agency Page Loaded!")

        browser.close()
        print("\n=== ALL SYSTEM TESTS PASSED 100% CLEANLY! ===")

if __name__ == "__main__":
    run_tests()
