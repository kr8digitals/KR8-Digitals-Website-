import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

print("=== STEP 6: END-TO-END CERTIFICATE GENERATION & QR VERIFICATION ===")

SKILLS_TEST = [
    {"key": "graphic", "name": "Grant Gideon", "track": "Graphic Design", "tier": "Professionalism", "template": "public/certificates/professionalism_graphic.png"},
    {"key": "video", "name": "Bio Nicz", "track": "Video Editing", "tier": "Completion", "template": "public/certificates/completion_video.png"},
    {"key": "content_creation", "name": "Elizabeth Oyejobi", "track": "Content Creation", "tier": "Professionalism", "template": "public/certificates/professionalism_content_creation.png"},
    {"key": "web", "name": "Maduka Samuel Ifeanyi", "track": "WordPress Website Development", "tier": "Completion", "template": "public/certificates/completion_web.png"},
    {"key": "quantum_ai", "name": "Afolayan Grace Oluwapelumi", "track": "Quantum AI & Automation", "tier": "Professionalism", "template": "public/certificates/reusable_professionalism.png", "is_dynamic": True},
]

font_path = "public/fonts/EncodeSans-Bold.ttf"

for item in SKILLS_TEST:
    img = Image.open(item["template"]).convert("RGBA")
    w, h = img.size
    
    # 1. Format name
    name = item["name"].upper()
    centerX = int(w * 0.4185)
    baselineY = int(h * 0.5116)
    maxAllowedWidth = int(w * 0.48)
    
    fontSize = int(w * 0.036)
    font = ImageFont.truetype(font_path, fontSize)
    bbox = font.getbbox(name)
    text_w = bbox[2] - bbox[0]
    while text_w > maxAllowedWidth and fontSize > 18:
        fontSize -= 1
        font = ImageFont.truetype(font_path, fontSize)
        bbox = font.getbbox(name)
        text_w = bbox[2] - bbox[0]
        
    draw = ImageDraw.Draw(img)
    textY = baselineY - max(8, int(fontSize * 0.14))
    draw.text((centerX, textY), name, font=font, fill=(18, 0, 31, 255), anchor="ms")
    
    # 2. Dynamic description if reusable
    if item.get("is_dynamic"):
        courseName = item["track"]
        achievement = "demonstrating excellence and proficiency in turning client requests into client satisfaction."
        desc_font = ImageFont.truetype(font_path, int(w * 0.016))
        desc_line1 = f"For successfully completing a {courseName} course with KR8 Digitals"
        desc_line2 = achievement
        draw.text((centerX, int(h * 0.57)), desc_line1, font=desc_font, fill=(122, 31, 168, 255), anchor="ms")
        draw.text((centerX, int(h * 0.61)), desc_line2, font=desc_font, fill=(18, 0, 31, 255), anchor="ms")
        
        # Stamp dynamic coach signature
        coach_sig = Image.open("public/signatures/web_dev_coach_signature.png")
        sig_w = int(w * 0.16)
        sig_h = int(coach_sig.height * (sig_w / coach_sig.width))
        coach_sig_resized = coach_sig.resize((sig_w, sig_h), Image.Resampling.LANCZOS)
        img.paste(coach_sig_resized, (int(w * 0.1475 - sig_w // 2), int(h * 0.8092 - sig_h - 4)), coach_sig_resized)

    # 3. Generate & Embed QR Code
    cert_id = f"CERT-KR8-{item['key'].upper()}-2026"
    verify_url = f"https://kr8digitals.com/verify?id={item['name'].replace(' ', '')}&cert={cert_id}"
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=4)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
    
    qr_size = int(w * 0.11)
    qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.NEAREST)
    
    # Bottom right badge
    badge_w = qr_size + 24
    badge_h = qr_size + 48
    badge_x = w - badge_w - int(w * 0.045)
    badge_y = h - badge_h - int(h * 0.055)
    
    # White card badge
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=12, fill=(255, 255, 255, 255), outline=(18, 0, 31, 40), width=2)
    img.paste(qr_img, (badge_x + 12, badge_y + 12), qr_img)
    
    out_file = f"/tmp/cert_{item['key']}_{item['tier'].lower()}.png"
    img.save(out_file)
    
    # Verify with OpenCV QR Detector
    cv_img = cv2.imread(out_file)
    detector = cv2.QRCodeDetector()
    decoded_text, points, _ = detector.detectAndDecode(cv_img)
    
    if decoded_text != verify_url:
        raise Exception(f"QR Code verification failed for {item['name']}! Expected {verify_url}, got '{decoded_text}'")
        
    print(f"✓ {item['track']} ({item['tier']}) - Student: {item['name']}:")
    print(f"   Template: {item['template']}")
    print(f"   Name span: width={text_w}px, centered={centerX}px")
    print(f"   QR Code Verified URL: {decoded_text}")
    print(f"   Output saved: {out_file} ({w}x{h}px)")

print("\n=======================================================")
print("=== ALL 5 SKILL TRACKS PASSED END-TO-END CERT TESTING ===")
print("=======================================================")
