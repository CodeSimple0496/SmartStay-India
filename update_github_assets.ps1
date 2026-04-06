# Copy screenshots from Assistant brain to project folder
Copy-Item "C:\Users\silen\.gemini\antigravity\brain\e28ec800-9a46-47f6-a775-5a98783a4c15\home_page_1775487050393.png" "d:\HotelBooking\public\screenshots\home_page.png" -Force
Copy-Item "C:\Users\silen\.gemini\antigravity\brain\e28ec800-9a46-47f6-a775-5a98783a4c15\search_results_page_1775487226426.png" "d:\HotelBooking\public\screenshots\search_results.png" -Force
Copy-Item "C:\Users\silen\.gemini\antigravity\brain\e28ec800-9a46-47f6-a775-5a98783a4c15\hotel_details_page_1775487260522.png" "d:\HotelBooking\public\screenshots\hotel_details.png" -Force

# Git operations
git add .
git commit -m "Update README with professional content and screenshots"
git push origin main
