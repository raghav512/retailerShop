export const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      i18n_locale: "en-US",
      select_language: "Select Language",
      continue: "Continue",
      home_title: "Home Screen",
      profile: "Profile",

      next: "Next",
      skip: "Skip",
      broadcasts: {
        title: "Broadcasts",
        detail_title: "Broadcast",
        no_broadcasts: "No broadcasts yet",
        empty_subtitle: "You'll see important updates and announcements here",
        for_everyone: "For Everyone",
        for_role: "For {{role}}s",
        access_denied: "You don't have access to this broadcast.",
        not_found: "Broadcast not found",
        go_back: "Go Back",
        load_failed: "Failed to load broadcast. Please try again.",
        time: {
          min: "min",
          mins: "mins",
          hour: "hour",
          hours: "hours",
          day: "day",
          days: "days",
          ago: "ago",
        },
      },
      "send_broadcast": {
        "title": "Send Broadcast",
        "message_details": "Message Details",
        "broadcast_title": "Title",
        "enter_title": "Enter title",
        "description": "Description",
        "enter_description": "Enter description",
        "settings_media": "Settings & Media",
        "target_audience": "Target Audience",
        "image_optional": "Image (Optional)",
        "select_image": "Tap to select an image",
        "send_btn": "Send Broadcast",
        "validation_error": "Validation",
        "title_desc_required": "Title and description are required",
        "success": "Success",
        "sent_success": "Broadcast sent successfully",
        "failed_to_send": "Failed to send broadcast",
        "error": "Error",
        "something_went_wrong": "Something went wrong while sending broadcast.",
        "permission_required": "Permission required",
        "storage_permission_msg": "Storage permission is required",
        "select_image_error": "Failed to pick image",
        "storage_permission_title": "Storage Permission",
        "storage_permission_body": "App needs access to your photos",
        "ask_me_later": "Ask Me Later",
        "cancel": "Cancel",
        "ok": "OK",
        "roles": {
            "farmer": "Farmer",
            "staff": "Staff"
        }
      },
      app_name: "App Name",

      buy_sell_title: "BUY & SELL",
      buy_sell_subtitle: "BUY & Sell with verified prices",
      buy_sell_card_subtitle: "with verified prices",

      lang_en_sub: "Practice farming in your language",
      lang_hi_sub: "Practice farming in Hindi",
      get_govt_subtitle: "Get government schemes and updates",

      /* ROLE SCREEN */
      role_welcome: "Welcome!",
      role_subtitle: "Choose your role to continue",
      role_farmer: "Farmer",
      role_farmer_desc: "Sell crops, buy inputs, manage farm",
      role_staff: "Procurement Staff",
      role_staff_desc: "Purchase crops, quality checks, stock",
      role_fpo: "FPO",
      role_fpo_desc: "Manage farmers, schemes",
      role_footer: "Your role helps us personalize your experience",

      /* LOGIN */
      login_title: "{{role}} Login",
      login_subtitle: "Enter your mobile number to continue",
      mobile_number: "Mobile Number",
      mobile_placeholder: "Enter 10-digit mobile number",
      login_with_otp: "Login with OTP",
      verify_and_login: "Verify & Login",
      login_with_google: "Login with Google",
      no_account: "Don’t have an account?",
      register_as: "Register as {{role}}",

      invalid_mobile_title: "Invalid Mobile",
      invalid_mobile_message: "Enter a valid 10-digit mobile number",



      /* SCREEN 1 */
      step_1_of_2: "Step 1 of 2",
      personal_details: "Personal Details",
      full_name: "Full Name",
      enter_full_name: "Enter your full name",
      mobile_number: "Mobile Number",
      mobile_placeholder_short: "0000000000",
      password: "Password",
      enter_password: "Enter password",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      village: "Village",
      enter_village: "Enter village name",

      error: "Error",
      fill_required_fields: "Please fill all required fields",

      /* SCREEN 2 */
      step_2_of_3: "Step 2 of 3",
      address_details: "Address Details",
      state: "State",
      district: "District",
      select_state: "Select State",
      select_district: "Select District",
      gps_address: "GPS Address",
      no_address_detected: "No address detected",
      current_location: "📍 Current Location",
      latitude: "Latitude",
      longitude: "Longitude",
      detect_gps: "Detect GPS Location",

      location_failed: "Failed to get location",
      location_found: "Location Found",
      address_not_available: "Address not available for this location",
      permission_denied: "Permission denied",
      location_permission_required: "Location permission is required",
      location_error: "Location Error",
      turn_on_location: "Please turn ON location services",
      open_settings: "Open Settings",

      /* STATES & DISTRICTS */
      states: [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
        "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi",
      ],

      districts: [
        "Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad", "Kolhapur", "Solapur",
      ],

      /* SCREEN 3 */
      step_3_of_4: "Step 3 of 4",
      farmer_category: "Farmer Category",
      select_farmer_category: "Select your farming category",
      select_farmer_category_alert: "Please select farmer category",

      farmer_small: "Small Farmer",
      farmer_small_sub: "1–2 hectares",

      farmer_marginal: "Marginal Farmer",
      farmer_marginal_sub: "Less than 1 hectare",

      farmer_medium: "Medium Farmer",
      farmer_medium_sub: "2–10 hectares",

      /* SCREEN 4 */
      step_4_of_5: "Step 4 of 5",
      crops_grown: "Crops Grown",
      current_year: "Year 1 (Current)",
      enter_crop_name: "Enter crop name",
      crop_name: "Crop Name",
      select_crop: "Select Crop",

      season: "Season",
      kharif: "Kharif",
      rabi: "Rabi",
      zaid: "Zaid",

      quantity_optional: "Quantity Produced (Optional)",
      quantity_placeholder: "e.g. 500 kg",

      select_crop_season: "Please select crop and season",

      kharif: "Kharif",
      rabi: "Rabi",
      zaid: "Zaid",

      /* CROPS */
      crop_rice: "Rice",
      crop_wheat: "Wheat",
      crop_maize: "Maize",
      crop_cotton: "Cotton",
      crop_sugarcane: "Sugarcane",
      crop_soybean: "Soybean",
      crop_groundnut: "Groundnut",

      /* SCREEN 5 */
      step_5_of_6: "Step 5 of 6",
      land_details: "Land Details",

      plot_id: "Plot ID",
      plot_placeholder: "e.g., PLOT-001",

      area_hectares: "Area (hectares)",
      area_placeholder: "e.g., 2.5",

      irrigation_type: "Irrigation Type",
      soil_type: "Soil Type",

      select_type: "Select Type",
      select_soil: "Select Soil",

      fill_land_details: "Please fill all land details",

      well: "Well",
      canal: "Canal",
      drip: "Drip Irrigation",
      sprinkler: "Sprinkler Irrigation",
      "rain-dependent": "Rain Dependent",

      alluvial: "Alluvial Soil",
      black: "Black Soil",
      red: "Red Soil",
      laterite: "Laterite Soil",
      desert: "Desert Soil",
      forest: "Forest Soil",
      peaty: "Peaty Soil",
      alkaline: "Alkaline Soil",
      irrigation_canal: "Canal",
      irrigation_borewell: "Borewell",
      irrigation_rainfed: "Rainfed",
      irrigation_drip: "Drip",
      soil_black: "Black Soil",
      soil_red: "Red Soil",
      soil_alluvial: "Alluvial Soil",
      soil_sandy: "Sandy Soil",


      // screen 6


      step_6_of_7: "Step 6 of 7",

      bank_details: "Bank Details",
      bank_optional_note: "Optional – for direct payments",

      bank_name: "Bank Name",
      bank_name_placeholder: "e.g., State Bank of India",

      ifsc_code: "IFSC Code",
      ifsc_placeholder: "e.g., SBIN0001234",

      account_number: "Account Number",
      account_placeholder: "Enter account number",


      /* SCREEN 7 */
      step_7_of_7: "Step 7 of 7",

      document_upload: "Document Upload",
      upload_supporting_documents: "Upload supporting documents",

      upload_soil_card: "Upload Soil Health Card",
      upload_lab_report: "Upload Lab Report",
      upload_gov_document: "Upload Government Scheme Document",

      complete_registration: "Complete Registration",

      disclaimer_short:
        "This application is privately developed and is not affiliated with any government entity.",

      view_details: "View details",
      hide_details: "Hide details",

      disclaimer_full:
        "This application is privately developed and does not represent any government organization or authority.\n\nInformation related to government schemes or programs displayed in this application is provided solely for informational purposes and is based on publicly available sources.\n\nUsers are advised to verify all details directly through official government websites or authorized channels before submitting documents or taking any action.",


      /* ALERTS */
      success: "Success",
      data_sent_success: "Data successfully sent to backend ✅",
      backend_error: "Backend error, check console",


      /* OTP SCREEN */
      verify_email: "Verify your Email",
      otp_sent_to: "We sent an OTP to:",
      enter_4_digit_otp: "Please enter 4 digit OTP",

      submit: "Submit",
      resend_otp: "Resend OTP",
      otp_resent: "OTP resent (dummy)",

      /* STAFF LOGIN */
      employee_login: "Employee Login",
      employee_login_sub: "Access your employee account",

      password: "Password",
      otp: "OTP",
      employee_id: "Employee ID",
      mobile: "Mobile",

      enter_employee_id: "Please enter Employee ID",
      enter_employee_id_ph: "Enter employee ID",
      enter_mobile_ph: "Enter mobile number",
      enter_valid_mobile: "Please enter valid mobile number",
      enter_password: "Please enter password",

      login: "Login",
      login_with_otp: "Login with OTP",
      login_success: "Login Success",

      login_type: "Login Type",
      id_type: "ID Type",

      forgot_password: "Forgot Password?",
      no_account: "Don’t have an account?",
      register_employee: "Register as Employee",

      error: "Error",

      /* EMPLOYEE REGISTRATION */
      back_to_login: "Back to Login",

      employee_registration: "Employee Registration",
      employee_registration_sub: "Create your employee account",

      first_name: "First Name",
      last_name: "Last Name",
      mobile_number: "Mobile Number",
      email: "Email",
      select_gender: "Select Gender",

      enter_first_name: "Enter first name",
      enter_last_name: "Enter last name",
      enter_mobile_number: "Enter mobile number",
      enter_email: "Enter email",

      state: "State",
      district: "District",
      village: "Village",

      select_state: "Select state",
      select_district: "Select district",
      select_village: "Select village",

      joining_date: "Joining Date",
      joining_date_ph: "DD/MM/YYYY",

      register: "Register",

      error: "Error",
      success: "Success",
      fill_required_fields: "Please fill all required fields",
      employee_registered_success: "Employee registered successfully",


      /* FPO LOGIN */
      fpo_login: "FPO Login",
      fpo_login_subtitle: "Login with GST number or mobile",

      gst_number: "GST Number",
      enter_gst: "Enter GST Number",

      mobile_number: "Mobile Number",
      enter_mobile: "Enter 10-digit mobile number",

      login: "Login",
      please_wait: "Please wait...",

      dont_have_account: "Don't have an account?",
      register_as_fpo: "Register as FPO",

      login_failed: "Login Failed",
      invalid_credentials: "Invalid credentials",

      /* FPO REGISTRATION */
      fpo_registration: "FPO Registration",
      fpo_registration_sub: "Create your retailer account",

      back_to_login: "Back to Login",

      first_name: "First Name",
      enter_first_name: "Enter your first name",

      last_name: "Last Name",
      enter_last_name: "Enter your last name",

      email: "Email",
      enter_email: "Enter your email",

      phone_number: "Phone Number",
      enter_phone: "Enter your phone number",

      state: "State",
      select_state: "Select state",

      district: "District",
      select_district: "Select district",

      village: "Village",
      select_village: "Select village",

      gst_number: "GST Number",
      enter_gst: "Enter GST number",

      register: "Register",

      error: "Error",
      success: "Success",
      fill_required_fields: "Please fill all required fields",
      registration_submitted: "Registration submitted successfully",


      states: [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
        "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi",
      ],

      districts: [
        "Pune", "Mumbai", "Nashik", "Nagpur",
        "Aurangabad", "Kolhapur", "Solapur",
      ],

      villages: [
        "Village A", "Village B", "Village C",
        "Village D", "Village E",
      ],

      "hello_farmer": "Hello, Farmer",
      "welcome_back": "Welcome back to Farmer Portal",
      "quick_actions": "Quick Actions",
      "recent_activities": "Recent Activities",
      "see_all": "See All",
      "create_listing": "Sell Crop",
      "buy_inputs": "Buy Inputs",
      "my_profile": "My Profile",
      "documents": "Documents",
      "my_farm": "My Farm",
      "my_crop": "My Crop",
      "crop_doctor": "Crop Doctor",
      "chatbot_label": "AI Assistant",
      "community": "Community",
      "mandi_prices": "Mandi Prices",
      "check_market_prices": "Check Market Prices",
      "enter_details_below": "Enter state, district and crop to see current market rates.",
      "crop_commodity": "Crop / Commodity",
      "enter_crop": "Enter Crop (e.g., Wheat)",
      "check_prices": "Check Prices",
      "no_prices_found": "No current prices found for this location and crop.",
      "mandi_prices_hint": "Results will appear here.",
      "select_state_first": "Select state first",
      "no_results": "No matching results",
      "search_state": "Search state...",
      "search_district": "Search district...",
      "latest_notifications": "Latest Notifications",


      // Community screens (MyPosts & AllPosts)
      "community_screen": {
        "all_posts": "All Posts",
        "my_posts": "My Posts",
        // MyPosts
        "my_posts_placeholder": "What's on your mind?",
        "edit_post_placeholder": "Edit your post...",
        "photo": "Photo",
        "post_btn": "Post",
        "update_btn": "Update",
        "cancel_btn": "Cancel",
        "edit_post": "Edit Post",
        "delete_post": "Delete Post",
        "no_posts_title": "No posts yet",
        "no_posts_sub": "Create your first post!",
        "post_created": "Post created successfully!",
        "post_updated": "Post updated successfully",
        "post_deleted": "Post deleted successfully",
        "delete_post_title": "Delete Post",
        "delete_post_msg": "Are you sure you want to delete this post?",
        "delete_btn": "Delete",
        "load_posts_failed": "Failed to load posts",
        "create_post_error": "Please enter text or select an image.",
        "user_not_found": "User not found!",
        "permission_title": "Permission Required",
        "permission_msg": "Please allow access to your photos.",
        "image_error": "Failed to pick image",
        // AllPosts
        "all_posts_loading": "Loading posts...",
        "no_posts_available": "No posts available",
        "comments_title": "Comments",
        "no_comments": "No comments yet. Be the first to comment!",
        "add_comment_placeholder": "Add a comment...",
        "login_to_interact": "Please login to perform this action",
        "failed_to_load": "Failed to load posts",
        "failed_to_comment": "Failed to add comment",
        "failed_action": "Failed to perform action"
      },

      // My Crops screen
      "my_crops": {
        "title": "My Crops",
        "loading": "Loading your crops...",
        "unknown_farm": "Unknown Farm",
        "empty_title": "No Crops Yet",
        "empty_text": "Start by adding your first crop to manage",
        "add_first": "Add First Crop",
        "load_failed": "Failed to load crops",
        "delete_title": "Delete Crop",
        "delete_confirm": "Are you sure you want to delete this crop?",
        "delete_btn": "Delete",
        "deleted_success": "Crop deleted successfully",
        "delete_failed": "Failed to delete crop"
      },

      // My Farms screen
      "my_farms": {
        "title": "My Farms",
        "loading": "Loading farms...",
        "empty": "No farms added yet",
        "load_failed": "Failed to load farms",
        "login_required": "Please login again",
        "delete_title": "Delete Farm",
        "delete_confirm": "Are you sure you want to delete this farm?",
        "delete_btn": "Delete",
        "deleted_success": "Farm deleted successfully",
        "delete_failed": "Failed to delete farm",
        "actions": "Actions",
        "view_details": "View details",
        "edit": "Edit"
      },

      // Add Crop screen
      "add_crop": {
        "title": "Add Crop",
        "select_farm": "Select Farm",
        "choose_farm": "Choose farm",
        "crop_name": "Crop Name",
        "crop_name_placeholder": "Enter crop name",
        "area": "Area",
        "area_placeholder": "Enter area",
        "unit": "Unit",
        "unit_placeholder": "acre",
        "sowing_date": "Sowing Date",
        "save_btn": "Add Crop",
        "fill_fields": "Please fill all fields",
        "login_required": "Please login again",
        "success": "Crop added successfully",
        "failed": "Failed to add crop"
      },

      // Edit Crop screen
      "edit_crop": {
        "title": "Edit Crop",
        "crop_name": "Crop Name",
        "crop_name_placeholder": "Enter crop name",
        "area": "Area",
        "area_placeholder": "Enter area",
        "unit": "Unit",
        "unit_placeholder": "acre",
        "sowing_date": "Sowing Date",
        "save_btn": "Save Changes",
        "fill_fields": "Please fill all fields",
        "success": "Crop updated successfully",
        "failed": "Failed to update crop"
      },

      // Edit Farm screen
      "edit_farm": {
        "title": "Edit Farm",
        "farm_name": "Farm Name",
        "farm_name_placeholder": "Enter farm name",
        "farm_area": "Farm Area",
        "farm_area_placeholder": "Enter area",
        "unit": "Unit",
        "acre": "Acre",
        "hectare": "Hectare",
        "save_btn": "Save Changes",
        "fill_name": "Please enter farm name",
        "fill_area": "Please enter valid area",
        "success": "Farm updated successfully",
        "failed": "Failed to update farm"
      },

      // Add Farm screen
      "add_farm": {
        "title": "Add Farm",
        "insufficient_markers_title": "Insufficient Markers",
        "insufficient_markers_msg": "Please place at least 3 markers to define your farm area",
        "fill_name": "Please enter farm name",
        "login_required": "Please login again.",
        "user_id_not_found": "User ID not found. Please login again.",
        "success": "Farm added successfully",
        "failed": "Failed to add farm",
        "search_placeholder": "Search nearby address",
        "your_location": "Your Location",
        "next": "Next",
        "markers_placed": "{{count}} markers placed",
        "enter_farm_name": "Enter Farm name",
        "farm_area": "Farm area",
        "acre": "Acre",
        "hectare": "Hectare",
        "saving": "Saving...",
        "cancel": "Cancel"
      },

      "profile_screens": {
        "personal_details": "Personal Details",
        "edit_personal_details": "Edit Personal Details",
        "updating": "Updating...",
        "update": "Update",
        "profile_updated": "Profile updated successfully!",
        "profile_update_failed": "Failed to update profile. Please try again.",
        "address_details": "Address Details",
        "edit_address_details": "Edit Address Details",
        "search_state": "Search state...",
        "search_district": "Search district...",
        "select_state_district": "Please select both state and district",
        "address_updated": "Address updated successfully!",
        "address_update_failed": "Failed to update address. Please try again.",
        "farmer_category_updated": "Farmer category updated successfully!",
        "farmer_category_failed": "Failed to update farmer category. Please try again.",
        "crops_grown": "Crops Grown",
        "edit_crops_grown": "Edit Crops Grown",
        "update_crop_info": "Update your crop information",
        "enter_crop_name_alert": "Please enter crop name",
        "crops_updated": "Crops grown updated successfully!",
        "crops_failed": "Failed to update crops grown",
        "season": "Season",
        "quantity_produced": "Quantity Produced (optional)",
        "enter_quantity": "Enter quantity",
        "save_changes": "Save Changes",
        "documents": "Documents",
        "bank_details": "Bank Details",
        "update_banking_info": "Update your banking information",
        "bank_name": "Bank Name",
        "enter_bank_name": "Enter bank name",
        "ifsc_code": "IFSC Code",
        "enter_ifsc": "Enter IFSC code",
        "account_number": "Account Number",
        "enter_account_number": "Enter account number",
        "fill_bank_details": "Please fill all bank details",
        "bank_updated": "Bank details updated successfully!",
        "bank_failed": "Failed to update bank details",
        "document_upload": "Document Upload",
        "upload_documents": "Upload Documents",
        "upload_supporting_docs": "Upload your supporting documents (Optional)",
        "upload_soil_card": "Upload Soil Health Card",
        "upload_lab_report": "Upload Lab Report",
        "upload_gov_doc": "Upload Government Document",
        "save_documents": "Save Documents",
        "upload_at_least_one": "Please upload at least one document",
        "docs_uploaded": "Documents uploaded successfully",
        "docs_failed": "Failed to upload documents",
        "disclaimer_text": "This application is privately developed and is not affiliated with, endorsed by, or representing any government entity.",
        "view_details": "View details",
        "hide_details": "Hide details",
        "disclaimer_content_1": "This application is privately developed and does not represent any government organization or authority.",
        "disclaimer_content_2": "Information related to government schemes or programs displayed in this application is provided solely for informational purposes and is based on publicly available sources.",
        "disclaimer_content_3": "Users are advised to verify all details directly through official government websites or authorized channels before submitting documents or taking any action."
      },
      "update_product": {
        "title": "Update Product",
        "update_btn": "Update Product",
        "updating": "Updating...",
        "success": "Success",
        "update_success": "Product updated successfully!",
        "update_failed": "Failed to update product. Please try again.",
        "saved_badge": "Saved",
        "limit_reached": "Limit Reached",
        "max_images": "Maximum 5 images allowed",
        "max_videos": "Maximum 3 videos allowed",
        "product_info": "Product Information",
        "category_crops": "Category & Crops",
        "technical_details_title": "Technical Details",
        "variants": "Product Variants",
        "variant_number": "Variant {{number}}",
        "video_number": "Video {{number}}",
        "add_video": "Add Video",
        "add_variant": "Add",
        "product_images": "Product Images",
        "product_images_count": "Product Images ({{count}}/5)",
        "product_name": "Product Name",
        "product_name_required": "Product Name *",
        "product_name_ph": "Enter product name",
        "description": "Description",
        "description_ph": "Enter product description",
        "brand": "Brand",
        "brand_required": "Brand *",
        "brand_ph": "Enter brand name",
        "product_videos": "Product Videos",
        "product_videos_count": "Product Videos ({{count}}/3)",
        "product_category": "Product Category",
        "product_category_required": "Product Category *",
        "select_category": "Select Category",
        "target_crops": "Target Crops",
        "target_crops_ph": "e.g. Wheat, Rice, Maize (comma separated)",
        "technical_details": "Technical Details",
        "technical_details_ph": "Enter technical details",
        "how_to_use": "How to Use",
        "how_to_use_ph": "Enter usage instructions",
        "product_benefits": "Product Benefits",
        "product_benefits_ph": "Enter product benefits",
        "sku": "SKU",
        "sku_ph": "Enter SKU",
        "unit": "Unit",
        "unit_required": "Unit *",
        "select": "Select",
        "mrp": "MRP",
        "mrp_required": "MRP *",
        "mrp_ph": "Enter MRP",
        "quantity": "Quantity",
        "quantity_required": "Quantity *",
        "quantity_ph": "Enter quantity",
        "purchase_date": "Purchase Date",
        "purchase_date_required": "Purchase Date *",
        "expiry_date": "Expiry Date",
        "date_ph": "YYYY-MM-DD",
        "add": "Add",
        "existing": "Existing"
      },

      "edit_profile": {
        "title": "Edit Profile",
        "subtitle": "Update your information",
        "personal_details": "Personal Details",
        "first_name": "First Name",
        "enter_first_name": "Enter first name",
        "last_name": "Last Name",
        "enter_last_name": "Enter last name",
        "email": "Email",
        "enter_email": "Enter email address",
        "update_btn": "Update Profile",
        "tap_to_change": "Tap to change photo",
        "uploading": "Uploading...",
        "image_success": "Profile image updated successfully",
        "image_error": "Failed to update profile image",
        "profile_success": "Profile updated successfully",
        "profile_error": "Failed to update profile. Please try again.",
        "success": "Success",
        "error": "Error"
      },



      //Documents

      "documents": "Documents",
      "manage_documents": "Manage your farming documents",
      "soil_health_card": "Soil Health Card",
      "soil_health_desc": "Upload your soil health card for better recommendations",
      "lab_reports": "Lab Reports",
      "lab_reports_desc": "Crop quality and soil test reports",
      "gov_documents": "Government Scheme Documents",
      "gov_documents_desc": "PM-KISAN, scheme enrollment certificates",
      "upload_document": "Upload Document",
      "reupload": "Re-upload",
      "view": "View",
      "why_upload": "Why upload documents?",
      "why_upload_desc": "Your documents help us verify your profile and provide better crop recommendations.",



      "marketplace": {
        "title": "Marketplace",
        "subtitle": "Buy high quality inputs for farming",
        "search": "Search products...",
        "add_to_cart": "Add to Cart",
        "no_products": "No products available",
        "expired": "Expired",
        "days_left": "{{days}} days left",
        "add_success": "Added to Cart!",
        "add_error": "Could not add to cart",
        "brand": "Brand",
        "all": "All",
        "variants": "variants",
        "no_products_cat": "No products found in {{category}}",
        "clear_filter": "Clear Filter",
        "select_variant": "Select Variant",
        "stock": "Stock: {{count}}",
        "quantity": "Quantity",
        "total_price": "Total Price",
        "fetching_details": "Fetching product details...",
        "product_details": "Product Details",
        "tab_overview": "Overview",
        "tab_details": "Details",
        "tab_videos": "Videos",
        "item_added_to_cart": "Item added to cart",
        "failed_add_to_cart": "Failed to add to cart",
        "loading_product": "Loading product details...",
        "tap_to_zoom": "Tap to zoom",
        "no_images": "No images available",
        "targets": "Targets: {{crops}}",
        "price_per_unit": "Price per {{unit}}",
        "in_stock": "{{count}} in stock",
        "product_videos": "Product Videos ({{count}})",
        "video_number": "Video {{number}}",
        "description": "Description",
        "product_info": "Product Info",
        "price_label": "Price",
        "stock_label": "Stock",
        "unit_label": "Unit",
        "brand_label": "Brand",
        "category_label": "Category",
        "target_crops": "Target Crops",
        "technical_details": "Technical Details",
        "how_to_use": "How to Use",
        "benefits": "Benefits",
        "no_details": "No detailed information available.",
        "no_videos": "No videos available for this product.",
        "product_video_number": "Product Video {{number}}",
        "tap_to_play": "Tap to play in-app",
        "total": "Total",
        "video_error": "Unable to play this video.",

        "categories": ["All", "Seeds", "Fertilizers", "Tools", "Pesticides"],

        "category": {
          "all": "All",
          "seeds": "Seeds",
          "fertilizers": "Fertilizers",
          "tools": "Tools",
          "pesticides": "Pesticides"
        },

        "products": [
          {
            "id": "1",
            "name": "Hybrid Tomato Seeds",
            "brand": "AgroVet Supplies",
            "price": "₹450",
            "unit": "per packet",
            "category": "Seeds",
            "icon": "🌱"
          },
          {
            "id": "2",
            "name": "Organic Fertilizer",
            "brand": "GreenGrow Industries",
            "price": "₹850",
            "unit": "per 50kg bag",
            "category": "Fertilizers",
            "icon": "🌾"
          }
        ]
      },

      "crop_doctor_screen": {
        "title": "Crop Doctor",
        "camera_permission_title": "Camera Permission",
        "camera_permission_msg": "App needs camera permission",
        "ask_me_later": "Ask Me Later",
        "cancel": "Cancel",
        "ok": "OK",
        "permission_required_title": "Permission Required",
        "camera_permission_denied": "Camera and storage permissions are required to take photos.",
        "storage_permission_denied": "Storage permission is required to access photos.",
        "camera_error": "Failed to open camera",
        "gallery_error": "Failed to open gallery",
        "no_image_title": "No Image",
        "please_select_image": "Please select an image first",
        "config_error_title": "Configuration Error",
        "api_key_missing": "Gemini API key is missing. Please check your config file.",
        "no_diagnosis_generated": "No diagnosis generated.",
        "daily_limit_title": "Daily Limit Reached",
        "daily_limit_msg": "You've reached your daily analysis limit. Please try again tomorrow.",
        "api_key_error_title": "API Key Error",
        "api_key_invalid": "Gemini API key is invalid. Please create a new key and update your config.",
        "analysis_failed": "Failed to analyze. Please try again.",
        "login_required": "Login Required",
        "login_to_save": "Please login to save diagnosis",
        "no_diagnosis": "No diagnosis to save",
        "already_saved": "This report is already saved!",
        "already_saved_title": "Already Saved",
        "max_reports_msg": "Maximum {{max}} reports can be stored. Please delete old reports to save new ones.",
        "storage_limit": "Storage Limit Reached",
        "session_expired": "Session Expired",
        "login_again": "Please login again",
        "login": "Login",
        "save_success_toast": "Diagnosis saved successfully! 🌾",
        "save_success_alert": "Diagnosis saved successfully!",
        "view_reports": "View Reports",
        "new_analysis": "New Analysis",
        "save_failed": "Failed to save",
        "no_image": "No Image Selected",
        "upload_prompt": "Upload a leaf photo to get started",
        "camera": "Camera",
        "gallery": "Gallery",
        "select_lang": "Select Language / भाषा चुनें:",
        "analyze": "Analyze Disease",
        "analyzing": "Analyzing...",
        "report_title": "Diagnosis Report",
        "saved": "Saved",
        "new_analysis_btn": "New Analysis"
      },

      "chatbot": {
        "title": "Beej Se Bazar AI",
        "today": "Today",
        "yesterday": "Yesterday",
        "bot_error_understand": "Sorry, I couldn't understand that. Please try again.",
        "bot_error_connect": "I'm having trouble connecting. Please check your internet and try again.",
        "bot_error_timeout": "Request timed out. Please try again.",
        "limit_reached_msg": "You've reached your daily limit of {{limit}} questions. Your limit will reset tomorrow! 🌅",
        "error_restart": "Unable to send message. Please restart the app.",
        "welcome_greeting": "Hello {{name}}! 👋\nWelcome to Beej Se Bazar AI 🌾\n\nI'm your smart farming assistant — here to help you with crop planning, weather updates, government schemes, and agri-tech insights.\n\nHow may I help you today?",
        "loading_chat": "Loading chat...",
        "bot_typing": "Bot is typing...",
        "daily_limit_reached": "📊 Daily limit reached ({{current}}/{{max}})",
        "resets_tomorrow": "Resets tomorrow at midnight",
        "placeholder_limit": "Daily limit reached...",
        "placeholder_normal": "Ask about farming, crops, weather...",
        "send": "Send",
        "chats_today": "{{current}}/{{max}} chats today",
        "voice_output": "Voice Output",
        "listening": "Listening...",
        "speak_now": "Speak now...",
        "done": "Done"
      },

      "cart": {
        "title": "My Cart",
        "load_error": "Failed to load cart",
        "already_removed": "This item was already removed. Refreshing...",
        "remove_error": "Failed to remove item from cart",
        "clear_cart_title": "Clear Cart",
        "clear_cart_msg": "Remove all items?",
        "clear": "Clear",
        "cancel": "Cancel",
        "clear_error": "Failed to clear cart",
        "limit_reached": "Limit Reached",
        "max_qty_msg": "Maximum quantity per item is 8",
        "update_error": "This item is no longer in your cart. Refreshing...",
        "update_fail": "Failed to update quantity",
        "unknown_item": "Unknown Item",
        "no_brand": "No Brand",
        "empty": "Your cart is empty",
        "total": "Total:",
        "checkout": "Proceed to Checkout",
        "order_success": "Order placed successfully!",
        "order_error": "Failed to place order. Please try again.",
        "subtotal": "Subtotal",
        "discount": "Discount",
        "apply": "Apply",
        "applied": "Applied",
        "coupon_success": "Coupon applied successfully!",
        "coupon_fail": "Failed to apply coupon",
        "payment_method": "Payment Method",
        "cash": "Cash",
        "credit": "Credit",
        "profile_incomplete": "Profile Incomplete",
        "update_personal_details": "Please update your personal details in the Profile section before placing an order.",
        "coupon_applied_success": "Coupon {{coupon}} applied successfully."
      },

      "my_orders": {
        "title": "My Orders",
        "search_id": "Search order ID...",
        "no_orders": "No Orders Found",
        "order_id": "Order ID:",
        "qty": "Qty:",
        "total": "Total: ₹"
      },

      "bank_details": "Bank Details",
      "documents": "Documents",
      "logout": "Logout",
      "edit": "Edit",
      "delete": "Delete",

      "listing": {
        "my_listings": "Sell Crop",
        "total": "{{count}} total listings",
        "status": {
          "approved": "Approved",
          "pending": "Pending",
          "sold": "Sold"
        },
        "load_failed": "Failed to load your listings. Please try again.",
        "delete_title": "Delete Listing",
        "delete_confirm": "Are you sure you want to delete this listing?",
        "delete_btn": "Delete",
        "deleted_success": "Listing deleted successfully",
        "delete_failed": "Failed to delete listing. Please try again.",
        "variety": "Variety",
        "loading": "Loading listings...",
        "empty": "No listings yet",
        "empty_sub": "Create your first crop listing"
      },
      "common": {
        "edit": "Edit",
        "delete": "Delete",
        "amount": "Amount",
        "date": "Date",
        "save": "Save Entry",
        "loading": "Loading..."
      },

      "create_listing": {
        "title": "Sell Crop",
        "crop_info": "Crop Information",
        "crop_name": "Crop Name",
        "variety": "Variety",
        "quantity": "Quantity (quintal)",
        "price": "Price (₹/quintal)",
        "location": "Location",
        "enter_location": "Enter location",
        "use_location": "Use current location",
        "upload_images": "Upload Images",
        "add": "Add",
        "submit": "Submit Listing",
        "fill_required": "Please fill all required fields",
        "submitted": "Listing submitted successfully"
      },

      "profile": {
        "role_farmer": "Farmer",
        "edit_profile": "Edit Profile",
        "logout": "Logout",
        "menu": {
          "personal_details": "Personal Details",
          "address_details": "Address Details",
          "farmer_category": "Farmer Category",
          "crops_grown": "Crops Grown",
          "land_details": "Land Details",
          "bank_details": "Bank Details",
          "uploaded_documents": "Uploaded Documents",
          "help_support": "Help & Support"
        }
      },

      "farmer_tabs": {
        "home": "Home",
        "marketplace": "Marketplace",
        "listings": "Sell Crop",
        "profile": "My Profile"
      },

      "fpo_dashboard": "FPO Dashboard",
      "manage_farmers": "Manage farmers and operations",

      "status": {
        "verified": "Verified",
        "pending": "Pending",
        "approved": "Approved",
        "rejected": "Rejected"
      },

      "farmer_listing_details": {
        "title": "Farmer Listing Details",
        "listing_status_success": "Listing {{status}} successfully!",
        "failed_update_status": "Failed to update status",
        "unknown": "Unknown",
        "purchase_date": "Purchase Date",
        "total_amount": "Total Amount",
        "images": "Images",
        "no_images": "No images available",
        "update_status": "Update Status",
        "approve": "Approve",
        "reject": "Reject",
        "quintal": "quintal"
      },
      "farm_details_title": "Farm Details",
      "add_product": {
        "title": "Add Product",
        "product_info": "Product Information",
        "category_crops": "Category & Crops",
        "add": "Add",
        "product_image": "Product Image",
        "select_image": "Select Image",

        "product_name": "Product Name",
        "product_name_placeholder": "Enter product name",
        "description": "Description",
        "description_placeholder": "Enter product description",
        "brand": "Brand",
        "brand_placeholder": "Enter brand name",
        "product_category": "Product Category *",
        "select_category": "Select Category",
        "target_crops": "Target Crops",
        "target_crops_placeholder": "e.g. Wheat, Rice, Maize (comma separated)",
        "technical_details": "Technical Details",
        "technical_details_placeholder": "Enter technical details",
        "how_to_use": "How to Use",
        "how_to_use_placeholder": "Enter usage instructions",
        "product_benefits": "Product Benefits",
        "product_benefits_placeholder": "Enter product benefits",
        "product_variants": "Product Variants",
        "variant": "Variant",
        "video": "Video",
        "sku": "SKU",

        "sku_placeholder": "Enter SKU",
        "unit": "Unit *",
        "select": "Select",
        "mrp": "MRP *",
        "mrp_placeholder": "Enter MRP",
        "quantity": "Quantity *",
        "quantity_placeholder": "Enter quantity",
        "purchase_date": "Purchase Date *",
        "expiry_date": "Expiry Date",
        "date_format": "YYYY-MM-DD",
        "save": "Save Product",
        "saving": "Saving...",
        "product_videos": "Product Videos",
        "add_video": "Add Video",
        "max_5_images": "Maximum 5 images allowed",
        "max_3_videos": "Maximum 3 videos allowed",
        "fill_required_fields": "Please fill all required fields"
      },
      "product_units": {
        "bag": "Bag",
        "packet": "Packet",
        "box": "Box",
        "bottle": "Bottle",
        "can": "Can",
        "ml": "ML",
        "gm": "GM"
      },
      "product_categories": {
        "fertilizers": "Fertilizers",
        "seeds": "Seeds",
        "insecticides": "Insecticides",
        "organic": "Organic",
        "pgr": "Plant Growth Regulator (PGR)",
        "animal_feed": "Animal Feed",
        "fungicides": "Fungicides",
        "herbicides": "Herbicides"
      },
      "seed_license": "Seed License",
      "fertilizer_license": "Fertilizer License",
      "procurement_license": "Procurement License",
      "gst_certificate": "GST Certificate",
      "cin_certificate": "CIN Certificate",
      "pan_card": "PAN Card",
      "insecticides_license": "Insecticides License",
      "ceo_documents": "CEO Documents",
      "bod_documents": "BOD Documents",
      "financial_documents": "Financial Documents",
      "upload_documents": "Upload Documents",
      "upload_licenses_desc": "Upload your licenses and certificates",
      "document_management": "Document Management",
      "document_management_desc": "Upload or replace your licenses and certificates. View uploaded documents anytime.",
      "document_uploaded": "Document uploaded",
      "no_document_uploaded": "No document uploaded",
      "view": "View",
      "replace": "Replace",
      "change": "Change",
      "select": "Select",
      "upload": "Upload",
      "loading_documents": "Loading documents...",
      "loading_files": "Loading files...",
      "fpo_documents": "FPO Documents",
      "licenses_certificates": "Licenses and certificates",
      "uploaded_colon": "Uploaded: ",
      "date_not_available": "Date not available",
      "download": "Download",
      "no_files_found": "No files found",
      "no_label_uploaded_yet": "No {{label}} have been uploaded yet.",
      "file_selected_title": "File Selected",
      "file_selected_success": "{{name}} selected successfully",
      "error": "Error",
      "select_doc_first": "Please select a document first",
      "success": "Success",
      "uploaded_successfully": "{{label}} uploaded successfully!",
      "upload_failed": "Upload Failed",
      "failed_to_upload": "Failed to upload document",
      "url_not_available": "File URL not available.",
      "cannot_open_file": "Cannot Open File",
      "device_cant_open": "Your device couldn't open this file.",
      "download_error": "Download Error",
      "download_url_not_available": "Download URL not available.",
      "downloading": "Downloading...",
      "download_started": "Your file download has started.",
      "download_failed": "Failed to download the file.",
      "delete_file": "Delete File",
      "delete_confirm_msg": "Are you sure you want to delete File {{index}}?",
      "file_deleted_success": "File deleted successfully.",
      "failed_to_delete": "Failed to delete file.",
      "allowed_up_to": "Allowed up to {{count}} files",
      "allowed_one_file": "Allowed 1 file",
      "upload_new": "Add New File",
      "replacing_file": "Replacing File {{index}}: ",
      "product_details_title": "Product Details",
      "product_description": "Description",
      "targets_label": "Targets: ",
      "brand_label": "Brand: ",
      "technical_details": "Technical Details",
      "how_to_use": "How to Use",
      "benefits": "Benefits",
      "product_videos_title": "Product Videos",
      "watch_video": "Watch Video",
      "available_variants": "Available Variants",
      "stock_label": "Stock: ",
      "exp_label": "Exp: ",
      "selected_variant_details": "Selected Variant Details",
      "parameter_label": "Parameter:",
      "mrp_label": "MRP:",
      "quantity_label": "Quantity:",
      "purchase_date_label": "Purchase Date:",
      "expiry_date_label": "Expiry Date:",
      "no_location_data": "No location data available",
      "no_farms_found": "No farms found for this farmer.",
      "unit_acre": "Acre",
      "farm_name": "Farm Name",
      "private_files": {
        "title": "My Private Files",
        "sub_title": "Documents uploaded for your account",
        "lab_reports": "Lab Reports",
        "soil_health_cards": "Soil Health Cards",
        "govt_scheme_docs": "Govt Scheme Docs",
        "no_files_found": "No files found",
        "no_files_uploaded": "No {{label}} have been uploaded yet.",
        "loading_files": "Loading files…",
        "uploaded_label": "Uploaded: ",
        "unnamed_file": "Unnamed File",
        "view": "View",
        "download": "Download",
        "cannot_open_file": "Cannot Open File",
        "device_cant_open_try_download": "Your device couldn't open this file. Try downloading it instead.",
        "download_error": "Download Error",
        "url_not_available": "File URL not available.",
        "download_url_not_available": "Download URL not available."
      },
      "area": "Area",
      "markers": "Markers",
      "points": "points",

      "total_farmers": "Total Farmers",
      "active_fields": "Active Fields",
      "pending_payments": "Pending Payments",

      "quick_actions": "Quick Action",
      "crop_statistics": "Crop Statistics",

      "add_farmer": "Add Farmer",
      "order_details": "Order Details",
      "farmer_listing": "Farmer Listing",
      "ledger": "Ledger",

      "wheat": "Wheat",
      "rice": "Rice",
      "cotton": "Cotton",
      "others": "Others",



      //Ladger


      "ledger": "Ledger",
      "ledger_date": "{{date}}",

      "pending_payments": "Pending Payments",
      "completed_today": "Completed Today",
      "paid_this_month": "Total Paid This Month",

      "download_ledger": "Download Ledger",
      "urgent": "Urgent",
      "due": "Due",
      "today": "Today",
      "mark_paid": "Mark as Paid",


      "farmer_management": "Farmer Management",
      "farmer_management_sub": "Master records & verification",
      "search_farmers": "Search farmers...",

      "filter": {
        "all": "All",
        "verified": "Verified",
        "pending": "Pending"
      },

      "status": {
        "verified": "Verified",
        "pending": "Pending"
      },

      "fields": "fields",
      "view_details": "View Details",

      // Inventory

      "inventory": {
        "title": "Inventory & Inputs",
        "add_product": "Add Product",
        "brand": "Brand",
        "mrp": "MRP",
        "update": "Update",
        "status": {
          "in": "In Stock",
          "low": "Low Stock"
        }
      },

      "profile": {
        "edit": "Edit Profile",
        "account_details": "Account Details",
        "account": {
          "phone": "Phone",
          "email": "Email",
          "location": "Location"
        },
        "features": {
          "field_crop_mapping": {
            "title": "Field & Crop Mapping",
            "sub": "Land and crop overview"
          },
          "schemes_subsidies": {
            "title": "Schemes & Subsidies",
            "sub": "Government programs"
          }
        },
        "settings": {
          "notifications": "Notifications",
          "language": "Language",
          "privacy": "Privacy & Security",
          "help": "Help & Support",
          "logout": "Logout"
        },
        "app_name": "KrishiGyan FPO App"
      },
      "roles": {
        "fpo": "FPO"
      },
      "field_mapping": {
        "title": "Field & Crop Mapping",
        "subtitle": "Land and crop overview",
        "area": "Area",
        "crop": "Crop",
        "status": "Status",
        "status_growing": "Growing",
        "status_harvesting": "Harvesting"
      },

      // schemessubside

      "schemes": {
        "title": "Schemes & Subsidies",
        "subtitle": "Government programs",
        "enrolled": "Enrolled",
        "amount": "Subsidy Amount"
      },

      // FPO tabs

      "tabs": {
        "home": "Home",
        "farmers": "Farmers",
        "inventory": "Inventory",
        "profile": "Profile"
      },


      // Employee tabs

      "tabs": {
        "home": "Home",
        "farmers": "Farmers",
        "buy": "Buy",
        "inventory": "Inventory",
        "profile": "Profile"
      },

      // employee home page

      "home": {
        "title": "Today's Dashboard",
        "subtitle": "Procurement Staff Portal",
        "add_listing": "View Listing",
        "view_listing": "View Listing",
        "create_listing": "Sell Crop",
        "farmers": "Farmers",
        "community": "Community",
        "recent_procurements": "Recent Procurements"
      },
      "stats": {
        "today_procurements": "Today's Procurements",
        "pending_quality": "Pending Quality Checks",
        "pending_payments": "Pending Payments"
      },

      "staff_create_listing": {
        "title": "Sell Crop for Farmer",
        "select_farmer": "Select Farmer",
        "tap_to_select": "Tap to select farmer",
        "crop_info": "Crop Information",
        "crop_name": "Crop Name",
        "variety": "Variety",
        "quantity": "Quantity (kg)",
        "price": "Price (₹/kg)",
        "location": "Location",
        "enter_location": "Enter farmer location",
        "use_current_location": " Use current location",
        "upload_images": "Upload Images",
        "add_photo": "Add Photo",
        "submit": "Sell Crop",
        "err_max_images": "Maximum 5 images allowed",
        "err_load_farmers": "Failed to load farmers",
        "err_select_farmer": "Please select a farmer",
        "err_fill_all": "Please fill all required fields",
        "err_min_image": "Please upload at least one image",
        "success": "Crop listing created",
        "err_create_failed": "Failed to sell crop"
      },

      "staff_listing_details": {
        "title": "Listing Details",
        "id": "ID",
        "purchase_date": "Purchase Date",
        "total_amount": "Total Amount",
        "images": "Images",
        "no_images": "No images available",
        "update_status": "Update Status",
        "approve": "Approve",
        "approved": "Approved",
        "reject": "Reject",
        "rejected": "Rejected",
        "success_msg": "Listing {{status}} successfully!",
        "err_failed": "Failed to update status",
        "unknown_farmer": "Unknown",
        "view_more": "View More"
      },

      "role": {
        "fpo": "FPO",
        "farmer": "Farmer",
        "staff": "Staff"
      },

      "fpo_profile": {
        "title": "My Profile",
        "edit": "Edit",
        "account_details": "Account Details",
        "account": {
          "phone": "Phone Number",
          "email": "Email Address",
          "shop": "Shop Name"
        },
        "features_title": "Features",
        "features": {
          "field_crop_mapping": {
            "title": "Field & Crop Mapping",
            "sub": "Manage mapping"
          },
          "schemes_subsidies": {
            "title": "Schemes & Subsidies",
            "sub": "View available schemes"
          },
          "documents": {
            "title": "Documents",
            "sub": "Licenses and certificates"
          }
        },
        "settings": {
          "title": "Settings",
          "notifications": "Notifications",
          "language": "Language",
          "privacy": "Privacy Policy",
          "help": "Help & Support",
          "logout": "Logout",
          "logout_msg": "Are you sure you want to logout?",
          "cancel": "Cancel"
        }
      },

      "fpo_tabs": {
        "home": "Home",
        "farmers": "Farmers",
        "inventory": "Inventory",
        "profile": "Profile"
      },

      "fpo_home": {
        "fpo_dashboard": "FPO Dashboard",
        "manage_farmers": "Manage your farmers and operations",
        "total_farmers": "Total Farmers",
        "active_fields": "Active Fields",
        "pending_payments": "Pending Payments",
        "quick_actions": "Quick Actions",
        "add_farmer": "Add Farmer",
        "order_details": "Order Details",
        "farmer_listing": "Farmer Listing",
        "Community": "Community",
        "expiring_products": "Expiring Products",
        "view_all": "View All",
        "show_less": "Show Less",
        "expired": "Expired",
        "no_expiring_products": "No products expiring soon"
      },

      "fpo_orders": {
        "orders_title": "Orders",
        "all": "ALL",
        "pending": "PENDING",
        "approved": "APPROVED",
        "sold": "SOLD",
        "rejected": "REJECTED",
        "ordered_items": "Ordered Items:",
        "unknown_item": "Unknown Item",
        "unit": "unit",
        "total": "Total",
        "no_orders_found": "No orders found",
        "order_details_title": "Order Details",
        "order_id": "Order ID",
        "phone": "Phone",
        "order_date": "Order Date",
        "total_amount": "Total Amount",
        "update_status": "Update Status",
        "approve_order": "Approve Order",
        "reject_order": "Reject Order",
        "order_already": "Order is already {{status}}",
        "order_success": "Order has been {{status}} successfully.",
        "failed_update": "Failed to update order status",
        "orders_fetch_failed": "Failed to fetch orders"
      },

      "common": {
        "amount": "Amount",
        "date": "Date",
        "not_available": "N/A"
      },
      "status": {
        "completed": "Completed"
      },


      "purchase": {
        "title": "Purchase Records",
        "add": "Add Purchase",
        "details": "Purchase Details",
        "farmer_details": "Farmer Details",
        "name_colon": "Name:",
        "date_colon": "Date:",
        "receipt_code": "Receipt Code:",
        "crops_purchased": "Crops Purchased",
        "no_crops_found": "No crops found.",
        "additional_details": "Additional Details",
        "center_colon": "Center:",
        "godown_colon": "Godown:",
        "vehicle_colon": "Vehicle:",
        "remarks_colon": "Remarks:",
        "summary": "Summary",
        "previous_dues": "Previous Dues:",
        "total_amount_colon": "Total Amount:",
        "download_receipt": "Download Receipt",
        "downloading_receipt": "Downloading Receipt...",
        "unit_quintal": "quintal",
        "no_data": "No purchase data found.",
        "unknown_farmer": "Unknown Farmer",
        "receipt_downloaded": "Receipt downloaded successfully to: {{path}}",
        "error_missing_id": "Purchase ID is missing.",
        "error_empty_data": "Purchase data is empty.",
        "error_failed_load": "Failed to load purchase details.",
        "error_failed_download": "Failed to download receipt."
      },
      "staff_product_details": {
        "title": "Product Details",
        "no_images": "No Images",
        "product_info": "Product Information",
        "available_variants": "Available Variants",
        "stock": "Stock",
        "expiry": "Exp",
        "variant_details": "Variant {{index}} Details",
        "sku_parameter": "SKU / Parameter",
        "mrp": "MRP",
        "stock_quantity": "Stock Quantity",
        "purchase_date": "Purchase Date",
        "expiry_date": "Expiry Date",
        "technical_details": "Technical Details",
        "technical_info": "Technical Info",
        "how_to_use": "How to Use",
        "benefits": "Benefits"
      },
      "filters": {
        "all": "All",
        "completed": "Completed",
        "pending": "Pending",
        "quality": "Quality Check"
      },
      "status": {
        "completed": "Completed",
        "pending": "Pending",
        "quality": "Quality Check",
        "verified": "Verified",
        "approved": "Approved",
        "rejected": "Rejected"
      },
      "common": {
        "amount": "Amount",
        "date": "Date"
      }
      ,

      "stock": {
        "title": "Stock Management",
        "add_product": "Add Product",
        "brand": "Brand",
        "mrp": "MRP",
        "in_stock": "In Stock",
        "expiry": "Expiry",
        "summary": {
          "low_stock": "Low Stock",
          "total_products": "Total Products",
          "near_expiry": "Near Expiry",
          "out_of_stock": "Out of Stock"
        },
        "status": {
          "in_stock": "In Stock",
          "low_stock": "Low Stock",
          "out_stock": "Out of Stock"
        }
      },
      "common": {
        "update": "Update"
      },
      "farmers": {
        "title": "Farmers",
        "search": "Search farmers...",
        "verified": "Verified",
        "fields": "fields",
        "add_farmer": "Add Farmer"
      },


      "profile": {
        "title": "Profile",
        "edit": "Edit Profile",
        "account_details": "Account Details",
        "features_title": "Features",
        "settings_title": "Settings",

        "account": {
          "phone": "Phone Number",
          "email": "Email Address",
          "shop": "Shop Name",
          "location": "Location",
          "gst": "GST Number"
        },

        "features": {
          "field_crop_mapping": {
            "title": "Field & Crop Mapping",
            "sub": "Land and crop details"
          },
          "schemes_subsidies": {
            "title": "Schemes & Subsidies",
            "sub": "Government programs"
          },
          "inventory": {
            "title": "Inventory Management",
            "sub": "Manage your stock"
          },
          "orders": {
            "title": "Orders",
            "sub": "Track your orders"
          }
        },

        "settings": {
          "notifications": "Notifications",
          "language": "Language",
          "privacy": "Privacy & Security",
          "help": "Help & Support",
          "logout": "Logout",
          "change_password": "Change Password",
          "terms": "Terms & Conditions",
          "about": "About App"
        },

        "logout": {
          "title": "Logout",
          "confirm": "Are you sure you want to logout?",
          "cancel": "Cancel"
        },

        "logout_confirm": "Are you sure you want to logout?",

        "roles": {
          "farmer": "Farmer",
          "staff": "Procurement Staff",
          "fpo": "FPO Administrator",
          "user": "User"
        }

      },
      "common": {
        "cancel": "Cancel"
      },


      /* ── MISSING / CONSOLIDATED KEYS ── */

      // OTP & Auth
      "verify_mobile": "Verify Mobile",
      "step_2_of_2": "Step 2 of 2",
      "sending_otp": "Sending OTP…",
      "otp_sent_success": "OTP sent successfully",
      "otp_send_failed": "Failed to send OTP",
      "otp_resent_success": "OTP resent successfully",
      "otp_resend_failed": "Failed to resend OTP",
      "enter_6_digit_otp": "Please enter 6-digit OTP",
      "invalid_otp": "Invalid OTP. Please try again.",
      "authentication_failed": "Authentication failed",
      "didnt_receive_otp": "Didn't receive OTP?",
      "mobile_required": "Mobile number is required",
      "file_pick_failed": "Failed to pick file",
      "something_went_wrong": "Something went wrong. Please try again.",
      "network_error": "Network error. Check your connection.",

      // Profile / Account
      "update": "Update",
      "update_profile": "Update Profile",
      "update_profile_sub": "Edit your personal information",
      "profile_updated": "Profile updated successfully",
      "shop_name": "Shop Name",
      "role_user": "User",
      "expiring_products": "Expiring Products",

      // Purchase form (add-purchase screen)
      "purchase": {
        "title": "Purchase Records",
        "add": "Add Purchase",
        "add_title": "Add Purchase",
        "add_subtitle": "Record a new crop procurement",
        "farmer": "Farmer",
        "choose_farmer": "Select Farmer",
        "crop": "Crop",
        "choose_crop": "Select Crop",
        "rate": "Rate (₹/kg)",
        "quantity": "Quantity (kg)",
        "date": "Purchase Date",
        "center": "Procurement Center",
        "godown": "Godown",
        "vehicle": "Vehicle Number",
        "remarks": "Remarks"
      },

      // Common (consolidated – overrides all earlier partials)
      "common": {
        "edit": "Edit",
        "delete": "Delete",
        "amount": "Amount",
        "date": "Date",
        "save": "Save Entry",
        "update": "Update",
        "cancel": "Cancel"
      },

      // Common with capital-C (used in some screens)
      "Common": {
        "amount": "Amount",
        "date": "Date"
      },


    },
  },



  hi: {
    translation: {
      welcome: "स्वागत है",
      i18n_locale: "hi-IN",
      select_language: "भाषा चुनें",
      continue: "जारी रखें",
      home_title: "होम स्क्रीन",
      profile: "प्रोफ़ाइल",

      next: "आगे",
      skip: "छोड़ें",
      broadcasts: {
        title: "प्रसारण",
        detail_title: "प्रसारण",
        no_broadcasts: "अभी तक कोई प्रसारण नहीं",
        empty_subtitle: "आपको यहाँ महत्वपूर्ण अपडेट और घोषणाएं दिखाई देंगी",
        for_everyone: "सभी के लिए",
        for_role: "{{role}} के लिए",
        access_denied: "आपके पास इस प्रसारण तक पहुँच नहीं है।",
        not_found: "प्रसारण नहीं मिला",
        go_back: "वापस जाएं",
        load_failed: "प्रसारण लोड करने में विफल। कृपया पुन: प्रयास करें।",
        time: {
          min: "मिनट",
          mins: "मिनट",
          hour: "घंटा",
          hours: "घंटे",
          day: "दिन",
          days: "दिन",
          ago: "पहले",
        },
      },
      "send_broadcast": {
        "title": "ब्रॉडकास्ट भेजें",
        "message_details": "संदेश विवरण",
        "broadcast_title": "शीर्षक",
        "enter_title": "शीर्षक दर्ज करें",
        "description": "विवरण",
        "enter_description": "विवरण दर्ज करें",
        "settings_media": "सेटिंग्स और मीडिया",
        "target_audience": "लक्षित दर्शक",
        "image_optional": "छवि (वैकल्पिक)",
        "select_image": "छवि चुनने के लिए टैप करें",
        "send_btn": "ब्रॉडकास्ट भेजें",
        "validation_error": "सत्यापन",
        "title_desc_required": "शीर्षक और विवरण आवश्यक हैं",
        "success": "सफलता",
        "sent_success": "ब्रॉडकास्ट सफलतापूर्वक भेजा गया",
        "failed_to_send": "ब्रॉडकास्ट भेजने में विफल",
        "error": "त्रुटि",
        "something_went_wrong": "ब्रॉडकास्ट भेजते समय कुछ गलत हो गया।",
        "permission_required": "अनुमति आवश्यक है",
        "storage_permission_msg": "स्टोरेज की अनुमति आवश्यक है",
        "select_image_error": "छवि चुनने में विफल",
        "storage_permission_title": "स्टोरेज अनुमति",
        "storage_permission_body": "ऐप को आपकी तस्वीरों तक पहुँच की आवश्यकता है",
        "ask_me_later": "बाद में पूछें",
        "cancel": "रद्द करें",
        "ok": "ठीक है",
        "roles": {
            "farmer": "किसान",
            "staff": "कर्मचारी"
        }
      },
      app_name: "ऐप नाम",

      buy_sell_title: "खरीदें और बेचें",
      buy_sell_subtitle: "सत्यापित कीमतों के साथ खरीदें और बेचें",
      buy_sell_card_subtitle: "सत्यापित कीमतों के साथ",

      lang_en_sub: "अपनी भाषा में खेती का अभ्यास करें",
      lang_hi_sub: "हिंदी में खेती का अभ्यास करें",
      get_govt_subtitle: "सरकारी योजनाएं और अपडेट प्राप्त करें",


      /* ROLE SCREEN */
      role_welcome: "स्वागत है!",
      role_subtitle: "जारी रखने के लिए अपनी भूमिका चुनें",
      role_farmer: "किसान",
      role_farmer_desc: "फसल बेचें, इनपुट खरीदें, खेती प्रबंधित करें",
      role_staff: "खरीद कर्मचारी",
      role_staff_desc: "फसल खरीद, गुणवत्ता जांच, स्टॉक",
      role_fpo: "एफपीओ",
      role_fpo_desc: "किसानों और योजनाओं का प्रबंधन",
      role_footer: "आपकी भूमिका हमें अनुभव बेहतर बनाने में मदद करती है",
      /* LOGIN */
      login_title: "{{role}} लॉगिन",
      login_subtitle: "जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें",
      mobile_number: "मोबाइल नंबर",
      mobile_placeholder: " 10 अंकों का मोबाइल नंबर दर्ज करें",
      login_with_otp: "ओटीपी से लॉगिन करें",
      login_with_google: "गूगल से लॉगिन करें",
      no_account: "खाता नहीं है?",
      register_as: "{{role}} के रूप में पंजीकरण करें",

      invalid_mobile_title: "अमान्य मोबाइल",
      invalid_mobile_message: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें",


      step_1_of_2: "चरण 1 / 2",
      personal_details: "व्यक्तिगत जानकारी",
      full_name: "पूरा नाम",
      enter_full_name: "अपना पूरा नाम दर्ज करें",
      mobile_number: "मोबाइल नंबर",
      mobile_placeholder_short: "0000000000",
      password: "पासवर्ड",
      enter_password: "पासवर्ड दर्ज करें",
      gender: "लिंग",
      select_gender: "लिंग चुनें",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      village: "गांव",
      enter_village: "गांव का नाम दर्ज करें",

      error: "त्रुटि",
      fill_required_fields: "कृपया सभी आवश्यक फ़ील्ड भरें",

      //screen 2


      step_2_of_3: "चरण 2 / 3",
      address_details: "पता विवरण",
      state: "राज्य",
      district: "जिला",
      select_state: "राज्य चुनें",
      select_district: "जिला चुनें",
      gps_address: "जीपीएस पता",
      no_address_detected: "कोई पता नहीं मिला",
      current_location: "📍 वर्तमान स्थान",
      latitude: "अक्षांश",
      longitude: "देशांतर",
      detect_gps: "जीपीएस लोकेशन पता करें",

      location_failed: "लोकेशन प्राप्त करने में विफल",
      location_found: "लोकेशन मिली",
      address_not_available: "इस लोकेशन के लिए पता उपलब्ध नहीं",
      permission_denied: "अनुमति अस्वीकृत",
      location_permission_required: "लोकेशन अनुमति आवश्यक है",
      location_error: "लोकेशन त्रुटि",
      turn_on_location: "कृपया लोकेशन चालू करें",
      open_settings: "सेटिंग्स खोलें",

      /* STATES & DISTRICTS */
      states: [
        "आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़",
        "गोवा", "गुजरात", "हरियाणा", "हिमाचल प्रदेश", "झारखंड",
        "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र", "मणिपुर",
        "मेघालय", "मिज़ोरम", "नागालैंड", "ओडिशा", "पंजाब", "राजस्थान",
        "सिक्किम", "तमिलनाडु", "तेलंगाना", "त्रिपुरा", "उत्तर प्रदेश",
        "उत्तराखंड", "पश्चिम बंगाल", "दिल्ली",
      ],

      districts: [
        "पुणे", "मुंबई", "नाशिक", "नागपुर", "औरंगाबाद", "कोल्हापुर", "सोलापुर",
      ],

      /* SCREEN 3 */
      step_3_of_4: "चरण 3 / 4",
      farmer_category: "किसान श्रेणी",
      select_farmer_category: "अपनी खेती की श्रेणी चुनें",
      select_farmer_category_alert: "कृपया किसान श्रेणी चुनें",

      farmer_small: "छोटा किसान",
      farmer_small_sub: "1–2 हेक्टेयर",

      farmer_marginal: "सीमांत किसान",
      farmer_marginal_sub: "1 हेक्टेयर से कम",

      farmer_medium: "मध्यम किसान",
      farmer_medium_sub: "2–10 हेक्टेयर",


      /* SCREEN 4 */
      step_4_of_5: "चरण 4 / 5",
      crops_grown: "उगाई गई फसलें",
      current_year: "वर्ष 1 (वर्तमान)",

      crop_name: "फसल का नाम",
      enter_crop_name: "फसल का नाम दर्ज करें",
      select_crop: "फसल चुनें",

      season: "मौसम",
      kharif: "खरीफ",
      rabi: "रबी",
      zaid: "जायद",

      quantity_optional: "उत्पादन मात्रा (वैकल्पिक)",
      quantity_placeholder: "उदाहरण: 500 किलो",

      select_crop_season: "कृपया फसल और मौसम चुनें",

      kharif: "खरीफ",
      rabi: "रबी",
      zaid: "जायद",


      /* CROPS */
      crop_rice: "चावल",
      crop_wheat: "गेहूं",
      crop_maize: "मक्का",
      crop_cotton: "कपास",
      crop_sugarcane: "गन्ना",
      crop_soybean: "सोयाबीन",
      crop_groundnut: "मूंगफली",

      /* SCREEN 5 */
      step_5_of_6: "चरण 5 / 6",
      land_details: "भूमि विवरण",

      plot_id: "प्लॉट आईडी",
      plot_placeholder: "उदाहरण: PLOT-001",

      area_hectares: "क्षेत्रफल (हेक्टेयर)",
      area_placeholder: "उदाहरण: 2.5",

      irrigation_type: "सिंचाई का प्रकार",
      soil_type: "मिट्टी का प्रकार",

      select_type: "प्रकार चुनें",
      select_soil: "मिट्टी चुनें",

      fill_land_details: "कृपया भूमि की सभी जानकारी भरें",

      /* IRRIGATION */
      irrigation_canal: "नहर",
      irrigation_borewell: "बोरवेल",
      irrigation_rainfed: "वर्षा आधारित",
      irrigation_drip: "ड्रिप सिंचाई",

      /* SOIL */
      soil_black: "काली मिट्टी",
      soil_red: "लाल मिट्टी",
      soil_alluvial: "जलोढ़ मिट्टी",
      soil_sandy: "रेतीली मिट्टी",


      /* SCREEN 6 */
      step_6_of_7: "चरण 6 / 7",

      bank_details: "बैंक विवरण",
      bank_optional_note: "वैकल्पिक – सीधे भुगतान के लिए",

      bank_name: "बैंक का नाम",
      bank_name_placeholder: "उदाहरण: स्टेट बैंक ऑफ इंडिया",

      ifsc_code: "आईएफएससी कोड",
      ifsc_placeholder: "उदाहरण: SBIN0001234",

      account_number: "खाता संख्या",
      account_placeholder: "खाता संख्या दर्ज करें",


      /* SCREEN 7 */
      step_7_of_7: "चरण 7 / 7",

      document_upload: "दस्तावेज़ अपलोड",
      upload_supporting_documents: "समर्थन दस्तावेज़ अपलोड करें",

      upload_soil_card: "मिट्टी स्वास्थ्य कार्ड अपलोड करें",
      upload_lab_report: "लैब रिपोर्ट अपलोड करें",
      upload_gov_document: "सरकारी योजना दस्तावेज़ अपलोड करें",

      complete_registration: "पंजीकरण पूरा करें",

      disclaimer_short:
        "यह ऐप निजी रूप से विकसित किया गया है और किसी भी सरकारी संस्था से संबद्ध नहीं है।",

      view_details: "विवरण देखें",
      hide_details: "विवरण छुपाएं",

      disclaimer_full:
        "यह ऐप निजी रूप से विकसित किया गया है और किसी भी सरकारी संगठन या प्राधिकरण का प्रतिनिधित्व नहीं करता है।\n\nइस ऐप में प्रदर्शित सरकारी योजनाओं या कार्यक्रमों की जानकारी केवल सूचनात्मक उद्देश्यों के लिए है और सार्वजनिक रूप से उपलब्ध स्रोतों पर आधारित है।\n\nकृपया किसी भी दस्तावेज़ जमा करने या कार्रवाई करने से पहले आधिकारिक सरकारी वेबसाइट या अधिकृत स्रोत से जानकारी सत्यापित करें।",

      /* ALERTS */
      success: "सफलता",
      data_sent_success: "डेटा सफलतापूर्वक बैकएंड को भेजा गया ✅",
      backend_error: "बैकएंड त्रुटि, कंसोल जांचें",


      /* OTP SCREEN */
      verify_email: "अपने ईमेल की पुष्टि करें",
      otp_sent_to: "हमने OTP भेजा है:",
      enter_4_digit_otp: "कृपया 4 अंकों का OTP दर्ज करें",

      submit: "सबमिट करें",
      resend_otp: "OTP पुनः भेजें",
      otp_resent: "OTP पुनः भेजा गया (डमी)",


      /* STAFF LOGIN */
      employee_login: "कर्मचारी लॉगिन",
      employee_login_sub: "अपने कर्मचारी खाते में प्रवेश करें",

      password: "पासवर्ड",
      otp: "ओटीपी",
      employee_id: "कर्मचारी आईडी",
      mobile: "मोबाइल",

      enter_employee_id: "कृपया कर्मचारी आईडी दर्ज करें",
      enter_employee_id_ph: "कर्मचारी आईडी दर्ज करें",
      enter_mobile_ph: "मोबाइल नंबर दर्ज करें",
      enter_valid_mobile: "कृपया सही मोबाइल नंबर दर्ज करें",
      enter_password: "कृपया पासवर्ड दर्ज करें",

      login: "लॉगिन",
      login_with_otp: "ओटीपी से लॉगिन करें",
      login_success: "लॉगिन सफल",
      "verify_and_login": "सत्यापित करें और लॉगिन करें",

      login_type: "लॉगिन प्रकार",
      id_type: "आईडी प्रकार",

      forgot_password: "पासवर्ड भूल गए?",
      no_account: "खाता नहीं है?",
      register_employee: "कर्मचारी के रूप में पंजीकरण करें",

      error: "त्रुटि",

      /* EMPLOYEE REGISTRATION */
      back_to_login: "लॉगिन पर वापस जाएं",

      employee_registration: "कर्मचारी पंजीकरण",
      employee_registration_sub: "अपना कर्मचारी खाता बनाएं",

      first_name: "पहला नाम",
      last_name: "अंतिम नाम",
      mobile_number: "मोबाइल नंबर",
      email: "ईमेल",

      enter_first_name: "पहला नाम दर्ज करें",
      enter_last_name: "अंतिम नाम दर्ज करें",
      enter_mobile_number: "मोबाइल नंबर दर्ज करें",
      enter_email: "ईमेल दर्ज करें",

      state: "राज्य",
      district: "जिला",
      village: "गांव",

      select_state: "राज्य चुनें",
      select_district: "जिला चुनें",
      select_village: "गांव चुनें",

      joining_date: "ज्वाइनिंग तिथि",
      joining_date_ph: "DD/MM/YYYY",

      register: "पंजीकरण करें",

      error: "त्रुटि",
      success: "सफल",
      fill_required_fields: "कृपया सभी आवश्यक फ़ील्ड भरें",
      employee_registered_success: "कर्मचारी सफलतापूर्वक पंजीकृत हुआ",


      /* FPO LOGIN */
      fpo_login: "एफपीओ लॉगिन",
      "farmer_listing_details": {
        "title": "किसान सूची विवरण",
        "listing_status_success": "सूची सफलतापूर्वक {{status}} हो गई!",
        "failed_update_status": "स्थिति अपडेट करने में विफल",
        "unknown": "अज्ञात",
        "purchase_date": "खरीद की तारीख",
        "total_amount": "कुल राशि",
        "images": "तस्वीरें",
        "no_images": "कोई चित्र उपलब्ध नहीं है",
        "update_status": "स्थिति अद्यतन करें",
        "approve": "स्वीकार करें",
        "reject": "अस्वीकार करें",
        "quintal": "क्विंटल"
      },
      farm_details_title: "खेत का विवरण",
      "add_product": {
        "title": "उत्पाद जोड़ें",
        "product_info": "उत्पाद की जानकारी",
        "category_crops": "श्रेणी और फसलें",
        "add": "जोड़ें",
        "product_image": "उत्पाद छवि",

        "select_image": "छवि चुनें",
        "product_name": "उत्पाद का नाम",
        "product_name_placeholder": "उत्पाद का नाम दर्ज करें",
        "description": "विवरण",
        "description_placeholder": "उत्पाद विवरण दर्ज करें",
        "brand": "ब्रांड",
        "brand_placeholder": "ब्रांड का नाम दर्ज करें",
        "product_category": "उत्पाद श्रेणी *",
        "select_category": "श्रेणी चुनें",
        "target_crops": "लक्षित फसलें",
        "target_crops_placeholder": "उदा. गेहूं, चावल, मक्का (अल्पविराम से अलग करें)",
        "technical_details": "तकनीकी विवरण",
        "technical_details_placeholder": "तकनीकी विवरण दर्ज करें",
        "how_to_use": "उपयोग कैसे करें",
        "how_to_use_placeholder": "उपयोग के निर्देश दर्ज करें",
        "product_benefits": "उत्पाद के लाभ",
        "product_benefits_placeholder": "उत्पाद के लाभ दर्ज करें",
        "product_variants": "उत्पाद प्रकार",
        "variant": "प्रकार",
        "video": "वीडियो",
        "sku": "SKU",

        "sku_placeholder": "SKU दर्ज करें",
        "unit": "इकाई *",
        "select": "चुनें",
        "mrp": "एमआरपी *",
        "mrp_placeholder": "एमआरपी दर्ज करें",
        "quantity": "मात्रा *",
        "quantity_placeholder": "मात्रा दर्ज करें",
        "purchase_date": "खरीद की तारीख *",
        "expiry_date": "समाप्ति तिथि",
        "date_format": "YYYY-MM-DD",
        "save": "उत्पाद सहेजें",
        "saving": "सहेजा जा रहा है...",
        "product_videos": "उत्पाद वीडियो",
        "add_video": "वीडियो जोड़ें",
        "max_5_images": "अधिकतम 5 चित्र अनुमत हैं",
        "max_3_videos": "अधिकतम 3 वीडियो अनुमत हैं",
        "fill_required_fields": "कृपया सभी आवश्यक फ़ील्ड भरें"
      },
      "product_units": {
        "bag": "बैग",
        "packet": "पैकेट",
        "box": "बॉक्स",
        "bottle": "बोतल",
        "can": "कैन",
        "ml": "एमएल",
        "gm": "ग्राम"
      },
      "product_categories": {
        "fertilizers": "उर्वरक",
        "seeds": "बीज",
        "insecticides": "कीटनाशक",
        "organic": "जैविक",
        "pgr": "प्लांट ग्रोथ रेगुलेटर (PGR)",
        "animal_feed": "पशु चारा",
        "fungicides": "फफूंदनाशक",
        "herbicides": "शाकनाशी"
      },
      "seed_license": "बीज लाइसेंस",
      "fertilizer_license": "उर्वरक लाइसेंस",
      "procurement_license": "खरीद लाइसेंस",
      "gst_certificate": "जीएसटी प्रमाणपत्र",
      "cin_certificate": "सीआईएन प्रमाणपत्र",
      "pan_card": "पैन कार्ड",
      "insecticides_license": "कीटनाशक लाइसेंस",
      "ceo_documents": "सीईओ दस्तावेज़",
      "bod_documents": "बीओडी दस्तावेज़",
      "financial_documents": "वित्तीय दस्तावेज़",
      "upload_documents": "दस्तावेज़ अपलोड करें",
      "upload_licenses_desc": "अपने लाइसेंस और प्रमाणपत्र अपलोड करें",
      "document_management": "दस्तावेज़ प्रबंधन",
      "document_management_desc": "अपने लाइसेंस और प्रमाणपत्र अपलोड या बदलें। अपलोड किए गए दस्तावेज़ों को कभी भी देखें।",
      "document_uploaded": "दस्तावेज़ अपलोड हो गया",
      "no_document_uploaded": "कोई दस्तावेज़ अपलोड नहीं हुआ",
      "view": "देखें",
      "replace": "बदलें",
      "change": "बदलें",
      "select": "चुनें",
      "upload": "अपलोड करें",
      "loading_documents": "दस्तावेज़ लोड हो रहे हैं...",
      "loading_files": "फ़ाइलें लोड हो रही हैं...",
      "fpo_documents": "FPO दस्तावेज़",
      "licenses_certificates": "लाइसेंस और प्रमाणपत्र",
      "uploaded_colon": "अपलोड किया गया: ",
      "date_not_available": "तारीख उपलब्ध नहीं",
      "download": "डाउनलोड करें",
      "no_files_found": "कोई फ़ाइल नहीं मिली",
      "no_label_uploaded_yet": "अभी तक कोई {{label}} अपलोड नहीं किया गया है।",
      "file_selected_title": "फ़ाइल चयनित",
      "file_selected_success": "{{name}} सफलतापूर्वक चुना गया",
      "error": "त्रुटि",
      "select_doc_first": "कृपया पहले दस्तावेज़ चुनें",
      "success": "सफलता",
      "uploaded_successfully": "{{label}} सफलतापूर्वक अपलोड किया गया!",
      "upload_failed": "अपलोड विफल",
      "failed_to_upload": "दस्तावेज़ अपलोड करने में विफल",
      "url_not_available": "फ़ाइल URL उपलब्ध नहीं है।",
      "cannot_open_file": "फ़ाइल नहीं खोल सकते",
      "device_cant_open": "आपका डिवाइस इस फ़ाइल को नहीं खोल सकता।",
      "download_error": "डाउनलोड त्रुटि",
      "download_url_not_available": "डाउनलोड URL उपलब्ध नहीं है।",
      "downloading": "डाउनलोड हो रहा है...",
      "download_started": "आपका फ़ाइल डाउनलोड शुरू हो गया है।",
      "download_failed": "फ़ाइल डाउनलोड करने में विफल।",
      "delete_file": "फ़ाइल हटाएं",
      "delete_confirm_msg": "क्या आप वाकई फ़ाइल {{index}} को हटाना चाहते हैं?",
      "file_deleted_success": "फ़ाइल सफलतापूर्वक हटा दी गई।",
      "failed_to_delete": "फ़ाइल हटाने में विफल।",
      "allowed_up_to": "{{count}} फ़ाइलों तक की अनुमति है",
      "allowed_one_file": "1 फ़ाइल की अनुमति है",
      "upload_new": "नई फ़ाइल जोड़ें",
      "replacing_file": "फ़ाइल {{index}} को बदला जा रहा है: ",
      product_details_title: "उत्पाद विवरण",
      product_description: "विवरण",
      targets_label: "लक्ष्य फसलें: ",
      brand_label: "ब्रांड: ",
      technical_details: "तकनीकी विवरण",
      how_to_use: "उपयोग कैसे करें",
      benefits: "फ़ायदे",
      product_videos_title: "उत्पाद वीडियो",
      watch_video: "वीडियो देखें",
      available_variants: "उपलब्ध वेरिएंट",
      stock_label: "स्टॉक: ",
      exp_label: "समाप्ति: ",
      selected_variant_details: "चयनित वेरिएंट विवरण",
      parameter_label: "पैरामीटर:",
      mrp_label: "एमआरपी:",
      quantity_label: "मात्रा:",
      purchase_date_label: "खरीद की तारीख:",
      expiry_date_label: "समाप्ति तिथि:",
      no_location_data: "कोई स्थान डेटा उपलब्ध नहीं है",
      no_farms_found: "इस किसान के लिए कोई खेत नहीं मिला।",
      unit_acre: "एकड़",
      farm_name: "खेत का नाम",
      "private_files": {
        "title": "मेरी निजी फ़ाइलें",
        "sub_title": "आपके खाते के लिए अपलोड किए गए दस्तावेज़",
        "lab_reports": "लैब रिपोर्ट",
        "soil_health_cards": "मृदा स्वास्थ्य कार्ड",
        "govt_scheme_docs": "सरकारी योजना दस्तावेज़",
        "no_files_found": "कोई फ़ाइल नहीं मिली",
        "no_files_uploaded": "अभी तक कोई {{label}} अपलोड नहीं की गई है।",
        "loading_files": "फ़ाइलें लोड हो रही हैं…",
        "uploaded_label": "अपलोड किया गया: ",
        "unnamed_file": "अनाम फ़ाइल",
        "view": "देखें",
        "download": "डाउनलोड",
        "cannot_open_file": "फ़ाइल नहीं खोल सकते",
        "device_cant_open_try_download": "आपका उपकरण इस फ़ाइल को नहीं खोल सका। इसके बजाय इसे डाउनलोड करने का प्रयास करें।",
        "download_error": "डाउनलोड त्रुटि",
        "url_not_available": "फ़ाइल URL उपलब्ध नहीं है।",
        "download_url_not_available": "डाउनलोड URL उपलब्ध नहीं है।"
      },
      area: "क्षेत्रफल",
      markers: "मार्कर",
      points: "बिंदु",

      "status": {
        "verified": "सत्यापित",
        "pending": "लंबित",
        "approved": "स्वीकृत",
        "rejected": "अस्वीकृत"
      },

      fpo_login_subtitle: "GST नंबर या मोबाइल से लॉगिन करें",

      gst_number: "जीएसटी नंबर",
      enter_gst: "जीएसटी नंबर दर्ज करें",

      mobile_number: "मोबाइल नंबर",
      enter_mobile: "10 अंकों का मोबाइल नंबर दर्ज करें",

      login: "लॉगिन करें",
      please_wait: "कृपया प्रतीक्षा करें...",

      dont_have_account: "खाता नहीं है?",
      register_as_fpo: "एफपीओ के रूप में पंजीकरण करें",

      login_failed: "लॉगिन विफल",
      invalid_credentials: "गलत विवरण",


      /* FPO REGISTRATION */
      fpo_registration: "एफपीओ पंजीकरण",
      fpo_registration_sub: "अपना रिटेलर खाता बनाएं",

      back_to_login: "लॉगिन पर वापस जाएं",

      first_name: "पहला नाम",
      enter_first_name: "पहला नाम दर्ज करें",

      last_name: "अंतिम नाम",
      enter_last_name: "अंतिम नाम दर्ज करें",

      email: "ईमेल",
      enter_email: "ईमेल दर्ज करें",

      phone_number: "मोबाइल नंबर",
      enter_phone: "मोबाइल नंबर दर्ज करें",

      state: "राज्य",
      select_state: "राज्य चुनें",

      district: "जिला",
      select_district: "जिला चुनें",

      village: "गांव",
      select_village: "गांव चुनें",

      gst_number: "जीएसटी नंबर",
      enter_gst: "जीएसटी नंबर दर्ज करें",

      register: "पंजीकरण करें",

      error: "त्रुटि",
      success: "सफल",
      fill_required_fields: "कृपया सभी आवश्यक फ़ील्ड भरें",
      registration_submitted: "पंजीकरण सफलतापूर्वक जमा किया गया",


      states: [
        "आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़",
        "गोवा", "गुजरात", "हरियाणा", "हिमाचल प्रदेश", "झारखंड",
        "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र", "मणिपुर",
        "मेघालय", "मिज़ोरम", "नागालैंड", "ओडिशा", "पंजाब", "राजस्थान",
        "सिक्किम", "तमिलनाडु", "तेलंगाना", "त्रिपुरा", "उत्तर प्रदेश",
        "उत्तराखंड", "पश्चिम बंगाल", "दिल्ली",
      ],

      districts: [
        "पुणे", "मुंबई", "नाशिक", "नागपुर",
        "औरंगाबाद", "कोल्हापुर", "सोलापुर",
      ],

      villages: [
        "गांव A", "गांव B", "गांव C",
        "गांव D", "गांव E",
      ],

      "hello_farmer": "नमस्ते किसान",
      "welcome_back": "किसान पोर्टल में आपका स्वागत है",
      "quick_actions": "त्वरित कार्य",
      "recent_activities": "हाल की गतिविधियाँ",
      "see_all": "सभी देखें",

      "create_listing": "फसल बेचें",
      "buy_inputs": "इनपुट खरीदें",
      "my_profile": "मेरी प्रोफ़ाइल",
      "documents": "दस्तावेज़",
      "my_farm": "मेरा खेत",
      "my_crop": "मेरी फसल",
      "crop_doctor": "फसल डॉक्टर",
      "chatbot_label": "AI सहायक",
      "community": "समुदाय",
      "mandi_prices": "मंडी के भाव",
      "check_market_prices": "बाजार के भाव देखें",
      "enter_details_below": "बाजार की वर्तमान दरें देखने के लिए अपना राज्य, जिला और फसल दर्ज करें।",
      "crop_commodity": "फसल / वस्तु",
      "enter_crop": "फसल दर्ज करें (जैसे, गेहूं)",
      "check_prices": "भाव देखें",
      "no_prices_found": "इस स्थान और फसल के लिए कोई भाव नहीं मिला।",
      "mandi_prices_hint": "परिणाम यहाँ दिखाई देंगे।",
      "select_state_first": "पहले राज्य चुनें",
      "no_results": "कोई परिणाम नहीं मिला",
      "search_state": "राज्य खोजें...",
      "search_district": "जिला खोजें...",
      "latest_notifications": "नवीनतम सूचनाएं",


      // Community screens (MyPosts & AllPosts)
      "community_screen": {
        "all_posts": "सभी पोस्ट",
        "my_posts": "मेरी पोस्ट",
        // MyPosts
        "my_posts_placeholder": "आपके मन में क्या है?",
        "edit_post_placeholder": "अपनी पोस्ट संपादित करें...",
        "photo": "फोटो",
        "post_btn": "पोस्ट करें",
        "update_btn": "अपडेट करें",
        "cancel_btn": "रद्द करें",
        "edit_post": "पोस्ट संपादित करें",
        "delete_post": "पोस्ट हटाएं",
        "no_posts_title": "अभी कोई पोस्ट नहीं",
        "no_posts_sub": "अपनी पहली पोस्ट बनाएं!",
        "post_created": "पोस्ट सफलतापूर्वक बनाई गई!",
        "post_updated": "पोस्ट सफलतापूर्वक अपडेट की गई",
        "post_deleted": "पोस्ट सफलतापूर्वक हटाई गई",
        "delete_post_title": "पोस्ट हटाएं",
        "delete_post_msg": "क्या आप वाकई इस पोस्ट को हटाना चाहते हैं?",
        "delete_btn": "हटाएं",
        "load_posts_failed": "पोस्ट लोड करने में विफल",
        "create_post_error": "कृपया टेक्स्ट दर्ज करें या कोई छवि चुनें।",
        "user_not_found": "उपयोगकर्ता नहीं मिला!",
        "permission_title": "अनुमति आवश्यक है",
        "permission_msg": "कृपया अपनी फ़ोटो तक पहुंच की अनुमति दें।",
        "image_error": "छवि चुनने में विफल",
        // AllPosts
        "all_posts_loading": "पोस्ट लोड हो रही हैं...",
        "no_posts_available": "कोई पोस्ट उपलब्ध नहीं",
        "comments_title": "टिप्पणियाँ",
        "no_comments": "अभी कोई टिप्पणी नहीं। पहली टिप्पणी करें!",
        "add_comment_placeholder": "टिप्पणी जोड़ें...",
        "login_to_interact": "यह कार्य करने के लिए कृपया लॉगिन करें",
        "failed_to_load": "पोस्ट लोड करने में विफल",
        "failed_to_comment": "टिप्पणी जोड़ने में विफल",
        "failed_action": "कार्य करने में विफल"
      },

      // My Crops screen
      "my_crops": {
        "title": "मेरी फसलें",
        "loading": "फसलें लोड हो रही हैं...",
        "unknown_farm": "अज्ञात खेत",
        "empty_title": "अभी कोई फसल नहीं",
        "empty_text": "अपनी पहली फसल जोड़कर शुरुआत करें",
        "add_first": "पहली फसल जोड़ें",
        "load_failed": "फसलें लोड करने में विफल",
        "delete_title": "फसल हटाएं",
        "delete_confirm": "क्या आप वाकई इस फसल को हटाना चाहते हैं?",
        "delete_btn": "हटाएं",
        "deleted_success": "फसल सफलतापूर्वक हटाई गई",
        "delete_failed": "फसल हटाने में विफल"
      },

      // My Farms screen
      "my_farms": {
        "title": "मेरे खेत",
        "loading": "खेत लोड हो रहे हैं...",
        "empty": "अभी कोई खेत नहीं जोड़ा गया",
        "load_failed": "खेत लोड करने में विफल",
        "login_required": "कृपया पुनः लॉगिन करें",
        "delete_title": "खेत हटाएं",
        "delete_confirm": "क्या आप वाकई इस खेत को हटाना चाहते हैं?",
        "delete_btn": "हटाएं",
        "deleted_success": "खेत सफलतापूर्वक हटाया गया",
        "delete_failed": "खेत हटाने में विफल",
        "actions": "कार्य",
        "view_details": "विवरण देखें",
        "edit": "संपादित करें"
      },

      //Documents

      "documents": "दस्तावेज़",
      "manage_documents": "अपने कृषि दस्तावेज़ प्रबंधित करें",
      "soil_health_card": "मिट्टी स्वास्थ्य कार्ड",
      "soil_health_desc": "बेहतर सुझावों के लिए अपना मिट्टी कार्ड अपलोड करें",
      "lab_reports": "प्रयोगशाला रिपोर्ट",
      "lab_reports_desc": "फसल गुणवत्ता और मिट्टी परीक्षण रिपोर्ट",
      "gov_documents": "सरकारी योजना दस्तावेज़",
      "gov_documents_desc": "पीएम-किसान और योजना प्रमाण पत्र",
      "upload_document": "दस्तावेज़ अपलोड करें",
      "reupload": "फिर से अपलोड करें",
      "view": "देखें",
      "why_upload": "दस्तावेज़ क्यों अपलोड करें?",
      "why_upload_desc": "दस्तावेज़ आपके प्रोफाइल को सत्यापित करने में मदद करते हैं।",

      "edit_profile": {
        "title": "प्रोफ़ाइल संपादित करें",
        "subtitle": "अपनी जानकारी अपडेट करें",
        "personal_details": "व्यक्तिगत विवरण",
        "first_name": "पहला नाम",
        "enter_first_name": "पहला नाम दर्ज करें",
        "last_name": "अंतिम नाम",
        "enter_last_name": "अंतिम नाम दर्ज करें",
        "email": "ईमेल",
        "enter_email": "ईमेल पता दर्ज करें",
        "update_btn": "प्रोफ़ाइल अपडेट करें",
        "tap_to_change": "फोटो बदलने के लिए टैप करें",
        "uploading": "अपलोड हो रहा है...",
        "image_success": "प्रोफ़ाइल छवि सफलतापूर्वक अपडेट की गई",
        "image_error": "प्रोफ़ाइल छवि अपडेट करने में विफल",
        "profile_success": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई",
        "profile_error": "प्रोफ़ाइल अपडेट करने में विफल। कृपया पुन: प्रयास करें।",
        "success": "सफलता",
        "error": "त्रुटि"
      },



      // Add Crop screen
      "add_crop": {
        "title": "फसल जोड़ें",
        "select_farm": "खेत चुनें",
        "choose_farm": "खेत चुनें",
        "crop_name": "फसल का नाम",
        "crop_name_placeholder": "फसल का नाम दर्ज करें",
        "area": "क्षेत्र",
        "area_placeholder": "क्षेत्र दर्ज करें",
        "unit": "इकाई",
        "unit_placeholder": "एकड़",
        "sowing_date": "बुवाई की तारीख",
        "save_btn": "फसल जोड़ें",
        "fill_fields": "कृपया सभी फ़ील्ड भरें",
        "login_required": "कृपया पुनः लॉगिन करें",
        "success": "फसल सफलतापूर्वक जोड़ी गई",
        "failed": "फसल जोड़ने में विफल"
      },

      // Edit Crop screen
      "edit_crop": {
        "title": "फसल संपादित करें",
        "crop_name": "फसल का नाम",
        "crop_name_placeholder": "फसल का नाम दर्ज करें",
        "area": "क्षेत्र",
        "area_placeholder": "क्षेत्र दर्ज करें",
        "unit": "इकाई",
        "unit_placeholder": "एकड़",
        "sowing_date": "बुवाई की तारीख",
        "save_btn": "परिवर्तन सहेजें",
        "fill_fields": "कृपया सभी फ़ील्ड भरें",
        "success": "फसल सफलतापूर्वक अपडेट की गई",
        "failed": "फसल अपडेट करने में विफल"
      },

      // Edit Farm screen
      "edit_farm": {
        "title": "खेत संपादित करें",
        "farm_name": "खेत का नाम",
        "farm_name_placeholder": "खेत का नाम दर्ज करें",
        "farm_area": "खेत का क्षेत्र",
        "farm_area_placeholder": "क्षेत्र दर्ज करें",
        "unit": "इकाई",
        "acre": "एकड़",
        "hectare": "हेक्टेयर",
        "save_btn": "परिवर्तन सहेजें",
        "fill_name": "कृपया खेत का नाम दर्ज करें",
        "fill_area": "कृपया वैध क्षेत्र दर्ज करें",
        "success": "खेत सफलतापूर्वक अपडेट किया गया",
        "failed": "खेत अपडेट करने में विफल"
      },

      // Add Farm screen
      "add_farm": {
        "title": "खेत जोड़ें",
        "insufficient_markers_title": "अपर्याप्त मार्कर",
        "insufficient_markers_msg": "अपने खेत के क्षेत्र को परिभाषित करने के लिए कृपया कम से कम 3 मार्कर लगाएं",
        "fill_name": "कृपया खेत का नाम दर्ज करें",
        "login_required": "कृपया पुनः लॉगिन करें।",
        "user_id_not_found": "उपयोगकर्ता आईडी नहीं मिली। कृपया पुनः लॉगिन करें।",
        "success": "खेत सफलतापूर्वक जोड़ा गया",
        "failed": "खेत जोड़ने में विफल",
        "search_placeholder": "आस-पास का पता खोजें",
        "your_location": "आपका स्थान",
        "next": "अगला",
        "markers_placed": "{{count}} मार्कर लगाए गए",
        "enter_farm_name": "खेत का नाम दर्ज करें",
        "farm_area": "खेत का क्षेत्रफल",
        "acre": "एकड़",
        "hectare": "हेक्टेयर",
        "saving": "सहेजा जा रहा है...",
        "cancel": "रद्द करें"
      },

      "profile_screens": {
        "personal_details": "व्यक्तिगत विवरण",
        "edit_personal_details": "व्यक्तिगत विवरण संपादित करें",
        "updating": "अपडेट हो रहा है...",
        "update": "अपडेट करें",
        "profile_updated": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
        "profile_update_failed": "प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
        "address_details": "पता विवरण",
        "edit_address_details": "पता विवरण संपादित करें",
        "search_state": "राज्य खोजें...",
        "search_district": "जिला खोजें...",
        "select_state_district": "कृपया राज्य और जिला दोनों चुनें",
        "address_updated": "पता सफलतापूर्वक अपडेट किया गया!",
        "address_update_failed": "पता अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
        "farmer_category_updated": "किसान श्रेणी सफलतापूर्वक अपडेट की गई!",
        "farmer_category_failed": "किसान श्रेणी अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
        "crops_grown": "उगाई जाने वाली फसलें",
        "edit_crops_grown": "उगाई जाने वाली फसलें संपादित करें",
        "update_crop_info": "अपनी फसल की जानकारी अपडेट करें",
        "enter_crop_name_alert": "कृपया फसल का नाम दर्ज करें",
        "crops_updated": "उगाई जाने वाली फसलें सफलतापूर्वक अपडेट की गईं!",
        "crops_failed": "उगाई जाने वाली फसलें अपडेट करने में विफल",
        "season": "मौसम",
        "quantity_produced": "उत्पादित मात्रा (वैकल्पिक)",
        "enter_quantity": "मात्रा दर्ज करें",
        "save_changes": "परिवर्तन सहेजें",
        "documents": "दस्तावेज़",
        "bank_details": "बैंक विवरण",
        "update_banking_info": "अपनी बैंकिंग जानकारी अपडेट करें",
        "bank_name": "बैंक का नाम",
        "enter_bank_name": "बैंक का नाम दर्ज करें",
        "ifsc_code": "IFSC कोड",
        "enter_ifsc": "IFSC कोड दर्ज करें",
        "account_number": "खाता संख्या",
        "enter_account_number": "खाता संख्या दर्ज करें",
        "fill_bank_details": "कृपया सभी बैंक विवरण भरें",
        "bank_updated": "बैंक विवरण सफलतापूर्वक अपडेट किए गए!",
        "bank_failed": "बैंक विवरण अपडेट करने में विफल",
        "document_upload": "दस्तावेज़ अपलोड",
        "upload_documents": "दस्तावेज़ अपलोड करें",
        "upload_supporting_docs": "अपने सहायक दस्तावेज़ अपलोड करें (वैकल्पिक)",
        "upload_soil_card": "मिट्टी स्वास्थ्य कार्ड अपलोड करें",
        "upload_lab_report": "लैब रिपोर्ट अपलोड करें",
        "upload_gov_doc": "सरकारी दस्तावेज़ अपलोड करें",
        "save_documents": "दस्तावेज़ सहेजें",
        "upload_at_least_one": "कृपया कम से कम एक दस्तावेज़ अपलोड करें",
        "docs_uploaded": "दस्तावेज़ सफलतापूर्वक अपलोड किए गए",
        "docs_failed": "दस्तावेज़ अपलोड करने में विफल",
        "disclaimer_text": "यह एप्लिकेशन निजी तौर पर विकसित किया गया है और यह किसी भी सरकारी संस्था से संबद्ध, समर्थित या उसका प्रतिनिधित्व नहीं करता है।",
        "view_details": "विवरण देखें",
        "hide_details": "विवरण छिपाएं",
        "disclaimer_content_1": "यह एप्लिकेशन निजी तौर पर विकसित किया गया है और किसी भी सरकारी संगठन या प्राधिकरण का प्रतिनिधित्व नहीं करता है।",
        "disclaimer_content_2": "इस एप्लिकेशन में प्रदर्शित सरकारी योजनाओं या कार्यक्रमों से संबंधित जानकारी पूरी तरह से सूचनात्मक उद्देश्यों के लिए प्रदान की गई है और सार्वजनिक रूप से उपलब्ध स्रोतों पर आधारित है।",
        "disclaimer_content_3": "उपयोगकर्ताओं को सलाह दी जाती है कि वे दस्तावेज़ जमा करने या कोई कार्रवाई करने से पहले सीधे आधिकारिक सरकारी वेबसाइटों या अधिकृत चैनलों के माध्यम से सभी विवरणों को सत्यापित करें।"
      },

      "marketplace": {
        "title": "मार्केटप्लेस",
        "subtitle": "खेती के लिए उच्च गुणवत्ता के इनपुट खरीदें",
        "search": "उत्पाद खोजें...",
        "add_to_cart": "कार्ट में जोड़ें",
        "no_products": "कोई उत्पाद उपलब्ध नहीं",
        "expired": "समाप्त",
        "days_left": "{{days}} दिन शेष",
        "item_added_to_cart": "आइटम कार्ट में जोड़ा गया",
        "failed_add_to_cart": "कार्ट में जोड़ने में विफल",
        "product_details": "उत्पाद विवरण",
        "brand": "ब्रांड",
        "all": "सभी",
        "variants": "प्रकार",
        "no_products_cat": "{{category}} में कोई उत्पाद नहीं मिला",
        "clear_filter": "फ़िल्टर साफ़ करें",
        "select_variant": "वेरिएंट चुनें",
        "stock": "स्टॉक",
        "quantity": "मात्रा",
        "total_price": "कुल कीमत",
        "tab_overview": "अवलोकन",
        "tab_details": "विवरण",
        "tab_videos": "वीडियो",
        "loading_product": "उत्पाद विवरण लोड हो रहा है...",
        "tap_to_zoom": "ज़ूम करने के लिए टैप करें",
        "no_images": "कोई छवि उपलब्ध नहीं",
        "targets": "लक्ष्य फसलें: {{crops}}",
        "price_per_unit": "{{unit}} की कीमत",
        "in_stock": "{{count}} स्टॉक में",
        "product_videos": "उत्पाद वीडियो ({{count}})",
        "video_number": "वीडियो {{number}}",
        "description": "विवरण",
        "product_info": "उत्पाद जानकारी",
        "price_label": "कीमत",
        "stock_label": "स्टॉक",
        "unit_label": "इकाई",
        "brand_label": "ब्रांड",
        "category_label": "श्रेणी",
        "target_crops": "लक्ष्य फसलें",
        "technical_details": "तकनीकी विवरण",
        "how_to_use": "उपयोग कैसे करें",
        "benefits": "फायदे",
        "no_details": "कोई विस्तृत जानकारी उपलब्ध नहीं।",
        "no_videos": "इस उत्पाद के लिए कोई वीडियो उपलब्ध नहीं।",
        "product_video_number": "उत्पाद वीडियो {{number}}",
        "tap_to_play": "इन-ऐप चलाने के लिए टैप करें",
        "total": "कुल",
        "video_error": "यह वीडियो चलाने में असमर्थ।",

        "categories": ["All", "Seeds", "Fertilizers", "Tools", "Pesticides"],

        "category": {
          "all": "सभी",
          "seeds": "बीज",
          "fertilizers": "उर्वरक",
          "tools": "औज़ार",
          "pesticides": "कीटनाशक"
        }
      },

      "crop_doctor_screen": {
        "title": "फसल डॉक्टर",
        "camera_permission_title": "कैमरा अनुमति",
        "camera_permission_msg": "ऐप को कैमरे की अनुमति चाहिए",
        "ask_me_later": "बाद में पूछें",
        "cancel": "रद्द करें",
        "ok": "ठीक है",
        "permission_required_title": "अनुमति आवश्यक",
        "camera_permission_denied": "फ़ोटो लेने के लिए कैमरा और स्टोरेज की अनुमति आवश्यक है।",
        "storage_permission_denied": "फ़ोटो एक्सेस करने के लिए स्टोरेज की अनुमति आवश्यक है।",
        "camera_error": "कैमरा खोलने में विफल",
        "gallery_error": "गैलरी खोलने में विफल",
        "no_image_title": "कोई चित्र नहीं",
        "please_select_image": "कृपया पहले एक चित्र चुनें",
        "config_error_title": "कॉन्फ़िगरेशन त्रुटि",
        "api_key_missing": "Gemini API कुंजी गायब है। कृपया अपनी कॉन्फ़िगरेशन फ़ाइल जांचें।",
        "no_diagnosis_generated": "कोई निदान उत्पन्न नहीं हुआ।",
        "daily_limit_title": "दैनिक सीमा पूरी हो गई",
        "daily_limit_msg": "आप अपनी दैनिक विश्लेषण सीमा पर पहुंच गए हैं। कृपया कल पुनः प्रयास करें।",
        "api_key_error_title": "API कुंजी त्रुटि",
        "api_key_invalid": "Gemini API कुंजी अमान्य है। कृपया एक नई कुंजी बनाएं और अपनी कॉन्फ़िगरेशन अपडेट करें।",
        "analysis_failed": "विश्लेषण करने में विफल। कृपया पुनः प्रयास करें।",
        "login_required": "लॉगिन आवश्यक है",
        "login_to_save": "कृपया निदान सहेजने के लिए लॉगिन करें",
        "no_diagnosis": "सहेजने के लिए कोई निदान नहीं है",
        "already_saved": "यह रिपोर्ट पहले से ही सहेजी गई है!",
        "already_saved_title": "पहले से सहेजा गया",
        "max_reports_msg": "अधिकतम {{max}} रिपोर्ट सहेजी जा सकती हैं। कृपया नई रिपोर्ट सहेजने के लिए पुरानी रिपोर्ट हटाएं।",
        "storage_limit": "स्टोरेज सीमा पूरी हो गई",
        "session_expired": "सत्र समाप्त हो गया",
        "login_again": "कृपया पुनः लॉगिन करें",
        "login": "लॉगिन करें",
        "save_success_toast": "निदान सफलतापूर्वक सहेजा गया! 🌾",
        "save_success_alert": "निदान सफलतापूर्वक सहेजा गया!",
        "view_reports": "रिपोर्ट देखें",
        "new_analysis": "नया विश्लेषण",
        "save_failed": "सहेजने में विफल",
        "no_image": "कोई चित्र नहीं चुना गया",
        "upload_prompt": "शुरू करने के लिए पत्ती की तस्वीर अपलोड करें",
        "camera": "कैमरा",
        "gallery": "गैलरी",
        "select_lang": "Select Language / भाषा चुनें:",
        "analyze": "पत्ती का विश्लेषण करें",
        "analyzing": "विश्लेषण हो रहा है...",
        "report_title": "निदान रिपोर्ट",
        "saved": "सहेजा गया",
        "new_analysis_btn": "नया विश्लेषण"
      },

      "chatbot": {
        "title": "Beej Se Bazar AI",
        "today": "आज",
        "yesterday": "कल",
        "bot_error_understand": "क्षमा करें, मैं वह समझ नहीं पाया। कृपया पुनः प्रयास करें।",
        "bot_error_connect": "मुझे कनेक्ट करने में समस्या हो रही है। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।",
        "bot_error_timeout": "अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।",
        "limit_reached_msg": "आप अपनी दैनिक सीमा {{limit}} प्रश्नों तक पहुँच गए हैं। आपकी सीमा कल रीसेट हो जाएगी! 🌅",
        "error_restart": "संदेश भेजने में असमर्थ। कृपया ऐप को पुनः आरंभ करें।",
        "welcome_greeting": "नमस्ते {{name}}! 👋\nकिसान परिवार AI में आपका स्वागत है 🌾\n\nमैं आपका स्मार्ट कृषि सहायक हूँ — फसल योजना, मौसम अपडेट, सरकारी योजनाओं और कृषि-तकनीक की जानकारी के साथ आपकी मदद करने के लिए यहाँ हूँ।\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
        "loading_chat": "चैट लोड हो रहा है...",
        "bot_typing": "बॉट टाइप कर रहा है...",
        "daily_limit_reached": "📊 दैनिक सीमा पूरी हो गई ({{current}}/{{max}})",
        "resets_tomorrow": "कल मध्यरात्रि में रीसेट होगा",
        "placeholder_limit": "दैनिक सीमा पूरी हो गई...",
        "placeholder_normal": "खेती, फसलों, मौसम के बारे में पूछें...",
        "send": "भेजें",
        "chats_today": "आज {{current}}/{{max}} चैट",
        "voice_output": "वॉयस आउटपुट",
        "listening": "सुन रहा हूँ...",
        "speak_now": "अभी बोलें...",
        "done": "पूर्ण"
      },

      "cart": {
        "title": "मेरा कार्ट",
        "load_error": "कार्ट लोड करने में विफल",
        "already_removed": "यह आइटम पहले ही हटा दिया गया था। रीफ्रेश हो रहा है...",
        "remove_error": "आइटम को कार्ट से हटाने में विफल",
        "clear_cart_title": "कार्ट खाली करें",
        "clear_cart_msg": "सभी आइटम हटाएं?",
        "clear": "खाली करें",
        "cancel": "रद्द करें",
        "clear_error": "कार्ट खाली करने में विफल",
        "limit_reached": "सीमा पूरी हो गई",
        "max_qty_msg": "प्रति आइटम अधिकतम मात्रा 8 है",
        "update_error": "यह आइटम अब आपके कार्ट में नहीं है। रीफ्रेश हो रहा है...",
        "update_fail": "मात्रा अपडेट करने में विफल",
        "unknown_item": "अज्ञात आइटम",
        "no_brand": "कोई ब्रांड नहीं",
        "empty": "आपका कार्ट खाली है",
        "total": "कुल:",
        "checkout": "चेकआउट के लिए आगे बढ़ें",
        "order_success": "ऑर्डर सफलतापूर्वक किया गया!",
        "order_error": "ऑर्डर करने में विफल। कृपया पुनः प्रयास करें।",
        "subtotal": "उप-योग",
        "discount": "छूट",
        "apply": "लागू करें",
        "applied": "लागू",
        "coupon_success": "कूपन सफलतापूर्वक लागू किया गया!",
        "coupon_fail": "कूपन लागू करने में विफल",
        "payment_method": "भुगतान का तरीका",
        "cash": "नकद",
        "credit": "क्रेडिट",
        "profile_incomplete": "प्रोफ़ाइल अधूरी है",
        "update_personal_details": "कृपया ऑर्डर देने से पहले प्रोफ़ाइल अनुभाग में अपने व्यक्तिगत विवरण अपडेट करें।",
        "coupon_applied_success": "कूपन {{coupon}} सफलतापूर्वक लागू किया गया।"
      },

      "my_orders": {
        "title": "मेरे ऑर्डर्स",
        "search_id": "ऑर्डर ID खोजें...",
        "no_orders": "कोई ऑर्डर नहीं मिला",
        "order_id": "ऑर्डर ID:",
        "qty": "मात्रा:",
        "total": "कुल: ₹"
      },

      "bank_details": "बैंक विवरण",
      "documents": "दस्तावेज़",
      "logout": "लॉगआउट",
      "edit": "संपादित करें",
      "delete": "हटाएं",

      "listing": {
        "my_listings": "फसल बेचें",
        "total": "कुल {{count}} लिस्टिंग",
        "status": {
          "approved": "स्वीकृत",
          "pending": "लंबित",
          "sold": "बिक गया"
        },
        "load_failed": "आपकी लिस्टिंग लोड करने में विफल। कृपया पुनः प्रयास करें।",
        "delete_title": "लिस्टिंग हटाएं",
        "delete_confirm": "क्या आप वाकई इस लिस्टिंग को हटाना चाहते हैं?",
        "delete_btn": "हटाएं",
        "deleted_success": "लिस्टिंग सफलतापूर्वक हटाई गई",
        "delete_failed": "लिस्टिंग हटाने में विफल। कृपया पुनः प्रयास करें।",
        "variety": "किस्म",
        "loading": "लिस्टिंग लोड हो रही है...",
        "empty": "अभी कोई लिस्टिंग नहीं",
        "empty_sub": "अपनी पहली फसल लिस्टिंग बनाएं"
      },
      "common": {
        "edit": "संपादित करें",
        "delete": "हटाएं",
        "amount": "राशि",
        "date": "तारीख",
        "save": "सेव करें",
        "cancel": "रद्द करें"
      },


      "create_listing": {
        "title": "फसल बेचें",
        "crop_info": "फसल की जानकारी",
        "crop_name": "फसल का नाम",
        "variety": "किस्म",
        "quantity": "मात्रा (क्विंटल)",
        "price": "कीमत (₹/क्विंटल)",
        "location": "स्थान",
        "enter_location": "स्थान दर्ज करें",
        "use_location": "वर्तमान स्थान उपयोग करें",
        "upload_images": "चित्र अपलोड करें",
        "add": "जोड़ें",
        "submit": "लिस्टिंग सबमिट करें",
        "fill_required": "कृपया सभी आवश्यक फ़ील्ड भरें",
        "submitted": "लिस्टिंग सफलतापूर्वक सबमिट हुई"
      },


      "profile": {
        "role_farmer": "किसान",
        "edit_profile": "प्रोफ़ाइल संपादित करें",
        "logout": "लॉगआउट",
        "menu": {
          "personal_details": "व्यक्तिगत विवरण",
          "address_details": "पता विवरण",
          "farmer_category": "किसान श्रेणी",
          "crops_grown": "उगाई गई फसलें",
          "land_details": "भूमि विवरण",
          "bank_details": "बैंक विवरण",
          "uploaded_documents": "अपलोड किए गए दस्तावेज़",
          "help_support": "मदद और सहायता"
        }
      },

      // "tabs": {
      //     "home": "होम",
      //     "marketplace": "मार्केट",
      //     "listings": "मेरी लिस्टिंग",
      //     "profile": "प्रोफ़ाइल"
      //   },

      "farmer_tabs": {
        "home": "होम",
        "marketplace": "मार्केट",
        "listings": "फसल बेचें",
        "profile": "प्रोफ़ाइल"
      },

      "fpo_dashboard": "एफपीओ डैशबोर्ड",
      "manage_farmers": "किसानों और संचालन का प्रबंधन करें",

      "total_farmers": "कुल किसान",
      "active_fields": "सक्रिय खेत",
      "pending_payments": "लंबित भुगतान",

      "quick_actions": "त्वरित कार्य",
      "crop_statistics": "फसल आँकड़े",

      "add_farmer": "किसान जोड़ें",
      "order_details": "ऑर्डर विवरण",
      "farmer_listing": "किसान लिस्टिंग",
      "ledger": "लेजर",

      "wheat": "गेहूं",
      "rice": "चावल",
      "cotton": "कपास",
      "others": "अन्य",


      //ladger

      "ledger": "लेजर",
      "ledger_date": "{{date}}",

      "pending_payments": "लंबित भुगतान",
      "completed_today": "आज पूर्ण हुए",
      "paid_this_month": "इस माह का कुल भुगतान",

      "download_ledger": "लेजर डाउनलोड करें",
      "urgent": "तत्काल",
      "due": "देय",
      "today": "आज",
      "mark_paid": "भुगतान चिह्नित करें",


      "farmer_management": "किसान प्रबंधन",
      "farmer_management_sub": "रिकॉर्ड और सत्यापन",
      "search_farmers": "किसान खोजें...",

      "filter": {
        "all": "सभी",
        "verified": "सत्यापित",
        "pending": "लंबित"
      },

      "status": {
        "verified": "सत्यापित",
        "pending": "लंबित"
      },

      "fields": "खेत",
      "view_details": "विवरण देखें",

      // Invetory

      "inventory": {
        "title": "इन्वेंटरी और इनपुट",
        "add_product": "उत्पाद जोड़ें",
        "brand": "ब्रांड",
        "mrp": "एमआरपी",
        "update": "अपडेट करें",
        "status": {
          "in": "उपलब्ध",
          "low": "कम स्टॉक"
        }
      },

      "profile": {
        "title": "प्रोफ़ाइल",
        "edit": "प्रोफ़ाइल संपादित करें",
        "account_details": "खाता विवरण",
        "features_title": "सुविधाएं",
        "settings_title": "सेटिंग्स",

        "account": {
          "phone": "फ़ोन नंबर",
          "email": "ईमेल पता",
          "shop": "दुकान का नाम",
          "location": "स्थान",
          "gst": "जीएसटी नंबर"
        },

        "features": {
          "field_crop_mapping": {
            "title": "खेत और फसल मानचित्रण",
            "sub": "भूमि और फसल विवरण"
          },
          "schemes_subsidies": {
            "title": "योजनाएं और सब्सिडी",
            "sub": "सरकारी कार्यक्रम"
          },
          "inventory": {
            "title": "इन्वेंटरी प्रबंधन",
            "sub": "अपना स्टॉक प्रबंधित करें"
          },
          "orders": {
            "title": "ऑर्डर",
            "sub": "अपने ऑर्डर ट्रैक करें"
          }
        },

        "settings": {
          "notifications": "सूचनाएं",
          "language": "भाषा",
          "privacy": "गोपनीयता और सुरक्षा",
          "help": "सहायता",
          "logout": "लॉगआउट",
          "change_password": "पासवर्ड बदलें",
          "terms": "नियम और शर्तें",
          "about": "ऐप के बारे में"
        },

        "logout": {
          "title": "लॉगआउट",
          "confirm": "क्या आप लॉगआउट करना चाहते हैं?",
          "cancel": "रद्द करें"
        },

        "logout_confirm": "क्या आप वाकई लॉगआउट करना चाहते हैं?",

        "roles": {
          "farmer": "किसान",
          "staff": "क्रय स्टाफ",
          "fpo": "एफपीओ प्रशासक",
          "user": "उपयोगकर्ता"
        }
      },


      // field mappoing 

      "field_mapping": {
        "title": "खेत और फसल मानचित्रण",
        "subtitle": "भूमि और फसल का विवरण",
        "area": "क्षेत्रफल",
        "crop": "फसल",
        "status": "स्थिति",
        "status_growing": "उग रही है",
        "status_harvesting": "कटाई चल रही है"
      },

      "schemes": {
        "title": "योजनाएँ और सब्सिडी",
        "subtitle": "सरकारी कार्यक्रम",
        "enrolled": "नामांकित किसान",
        "amount": "सब्सिडी राशि"
      },

      // FPO Tabs
      "tabs": {
        "home": "होम",
        "farmers": "किसान",
        "inventory": "स्टॉक",
        "profile": "प्रोफ़ाइल"
      },



      // employee tabs

      "tabs": {
        "home": "होम",
        "farmers": "किसान",
        "buy": "खरीदें",
        "inventory": "इन्वेंटरी",
        "profile": "प्रोफ़ाइल"
      },

      // employee home page 


      "home": {
        "title": "आज का डैशबोर्ड",
        "subtitle": "खरीद स्टाफ पोर्टल",
        "add_listing": "लिस्टिंग देखें",
        "view_listing": "लिस्टिंग देखें",
        "create_listing": "फसल बेचें",
        "farmers": "किसान",
        "community": "समुदाय",
        "recent_procurements": "हाल की खरीद"
      },
      "stats": {
        "today_procurements": "आज की खरीद",
        "pending_quality": "लंबित गुणवत्ता जांच",
        "pending_payments": "लंबित भुगतान"
      },

      "staff_create_listing": {
        "title": "किसान के लिए फसल बेचें",
        "select_farmer": "किसान चुनें",
        "tap_to_select": "किसान चुनने के लिए टैप करें",
        "crop_info": "फसल की जानकारी",
        "crop_name": "फसल का नाम",
        "variety": "किस्म",
        "quantity": "मात्रा (किलोग्राम)",
        "price": "मूल्य (₹/किलोग्राम)",
        "location": "स्थान",
        "enter_location": "किसान का स्थान दर्ज करें",
        "use_current_location": " वर्तमान स्थान का उपयोग करें",
        "upload_images": "तस्वीरें अपलोड करें",
        "add_photo": "तस्वीर जोड़ें",
        "submit": "फसल बेचें",
        "err_max_images": "अधिकतम 5 चित्र अनुमत हैं",
        "err_load_farmers": "किसानों को लोड करने में विफल",
        "err_select_farmer": "कृपया एक किसान चुनें",
        "err_fill_all": "कृपया सभी आवश्यक फ़ील्ड भरें",
        "err_min_image": "कृपया कम से कम एक चित्र अपलोड करें",
        "success": "फसल लिस्टिंग बनाई गई",
        "err_create_failed": "लिस्टिंग बनाने में विफल"
      },

      "staff_listing_details": {
        "title": "लिस्टिंग विवरण",
        "id": "आईडी",
        "purchase_date": "खरीद की तारीख",
        "total_amount": "कुल राशि",
        "images": "तस्वीरें",
        "no_images": "कोई तस्वीर उपलब्ध नहीं",
        "update_status": "स्थिति अपडेट करें",
        "approve": "स्वीकृत करें",
        "approved": "स्वीकृत",
        "reject": "अस्वीकार करें",
        "rejected": "अस्वीकृत",
        "success_msg": "लिस्टिंग सफलतापूर्वक {{status}} की गई!",
        "err_failed": "स्थिति अपडेट करने में विफल",
        "unknown_farmer": "अज्ञात",
        "view_more": "और देखें"
      },

      "role": {
        "fpo": "एफपीओ",
        "farmer": "किसान",
        "staff": "कर्मचारी"
      },

      "fpo_profile": {
        "title": "मेरी प्रोफ़ाइल",
        "edit": "संपादित करें",
        "account_details": "खाता विवरण",
        "account": {
          "phone": "फ़ोन नंबर",
          "email": "ईमेल पता",
          "shop": "दुकान का नाम"
        },
        "features_title": "सुविधाएं",
        "features": {
          "field_crop_mapping": {
            "title": "खेत और फसल मैपिंग",
            "sub": "मैपिंग प्रबंधित करें"
          },
          "schemes_subsidies": {
            "title": "योजनाएं और सब्सिडी",
            "sub": "उपलब्ध योजनाएं देखें"
          },
          "documents": {
            "title": "दस्तावेज़",
            "sub": "लाइसेंस और प्रमाणपत्र"
          }
        },
        "settings": {
          "title": "सेटिंग्स",
          "notifications": "सूचनाएं",
          "language": "भाषा",
          "privacy": "गोपनीयता नीति",
          "help": "मदद और समर्थन",
          "logout": "लॉग आउट",
          "logout_msg": "क्या आप वाकई लॉग आउट करना चाहते हैं?",
          "cancel": "रद्द करें"
        }
      },

      "fpo_tabs": {
        "home": "होम",
        "farmers": "किसान",
        "inventory": "इन्वेंटरी",
        "profile": "प्रोफ़ाइल"
      },

      "fpo_home": {
        "fpo_dashboard": "एफपीओ डैशबोर्ड",
        "manage_farmers": "अपने किसानों और संचालन का प्रबंधन करें",
        "total_farmers": "कुल किसान",
        "active_fields": "सक्रिय खेत",
        "pending_payments": "लंबित भुगतान",
        "quick_actions": "त्वरित कार्रवाइयां",
        "add_farmer": "किसान जोड़ें",
        "order_details": "ऑर्डर विवरण",
        "farmer_listing": "किसान सूची",
        "Community": "समुदाय",
        "expiring_products": "समाप्त होने वाले उत्पाद",
        "view_all": "सभी देखें",
        "show_less": "कम दिखाएं",
        "expired": "समाप्त",
        "no_expiring_products": "कोई भी उत्पाद जल्द समाप्त नहीं हो रहा है"
      },

      "fpo_orders": {
        "orders_title": "ऑर्डर",
        "all": "सभी",
        "pending": "लंबित",
        "approved": "स्वीकृत",
        "sold": "बेचा गया",
        "rejected": "अस्वीकृत",
        "ordered_items": "ऑर्डर किए गए आइटम:",
        "unknown_item": "अज्ञात आइटम",
        "unit": "इकाई",
        "total": "कुल",
        "no_orders_found": "कोई ऑर्डर नहीं मिला",
        "order_details_title": "ऑर्डर विवरण",
        "order_id": "ऑर्डर आईडी",
        "phone": "फ़ोन",
        "order_date": "ऑर्डर की तारीख",
        "total_amount": "कुल राशि",
        "update_status": "स्थिति अपडेट करें",
        "approve_order": "ऑर्डर स्वीकृत करें",
        "reject_order": "ऑर्डर अस्वीकार करें",
        "order_already": "ऑर्डर पहले ही {{status}} है",
        "order_success": "ऑर्डर सफलतापूर्वक {{status}} कर दिया गया है।",
        "failed_update": "ऑर्डर स्थिति अपडेट करने में विफल",
        "orders_fetch_failed": "ऑर्डर प्राप्त करने में विफल"
      },

      "Common": {
        "amount": "राशि",
        "date": "तारीख"
      },

      "status": {
        "completed": "पूर्ण"
      },


      "purchase": {
        "title": "खरीद रिकॉर्ड",
        "add": "खरीद जोड़ें"
      },
      "filters": {
        "all": "सभी",
        "completed": "पूर्ण",
        "pending": "लंबित",
        "quality": "गुणवत्ता जांच"
      },
      "status": {
        "completed": "पूर्ण",
        "pending": "लंबित",
        "quality": "गुणवत्ता जांच",
        "verified": "सत्यापित",
        "approved": "स्वीकृत",
        "rejected": "अस्वीकृत"
      },
      "Common": {
        "amount": "राशि",
        "date": "तारीख"
      },

      "stock": {
        "title": "स्टॉक प्रबंधन",
        "add_product": "उत्पाद जोड़ें",
        "brand": "ब्रांड",
        "mrp": "एमआरपी",
        "in_stock": "स्टॉक में",
        "expiry": "समाप्ति तिथि",
        "summary": {
          "low_stock": "कम स्टॉक",
          "total_products": "कुल उत्पाद",
          "near_expiry": "समाप्ति के पास",
          "out_of_stock": "स्टॉक समाप्त"
        },
        "status": {
          "in_stock": "स्टॉक में",
          "low_stock": "कम स्टॉक",
          "out_stock": "स्टॉक समाप्त"
        }
      },
      "common": {
        "update": "अपडेट"
      },
      "farmers": {
        "title": "किसान",
        "search": "किसान खोजें...",
        "verified": "सत्यापित",
        "fields": "खेत",
        "add_farmer": "किसान जोड़ें"
      },


      "profile": {
        "title": "प्रोफ़ाइल",
        "procurement_staff": "खरीद कर्मचारी",
        "account_details": "खाता विवरण",
        "settings_title": "सेटिंग्स",
        "logout": "लॉगआउट",
        "logout_title": "लॉगआउट",
        "logout_confirm": "क्या आप वाकई लॉगआउट करना चाहते हैं?",
        "account": {
          "phone": "फ़ोन नंबर",
          "email": "ईमेल पता",
          "location": "स्थान"
        },
        "roles": {
          "procurement_staff": "खरीद कर्मचारी"
        },
        "settings": {
          "notifications": "सूचनाएं",
          "language": "भाषा",
          "privacy": "गोपनीयता और सुरक्षा",
          "help": "मदद"
        }
      },
      "common": {
        "cancel": "रद्द करें"
      },


      /* ── गुम / समेकित कुंजियाँ ── */

      // OTP & प्रमाणीकरण
      "verify_mobile": "मोबाइल सत्यापित करें",
      "step_2_of_2": "चरण 2 / 2",
      "sending_otp": "OTP भेजा जा रहा है…",
      "otp_sent_success": "OTP सफलतापूर्वक भेजा गया",
      "otp_send_failed": "OTP भेजने में विफल",
      "otp_resent_success": "OTP पुनः भेजा गया",
      "otp_resend_failed": "OTP पुनः भेजने में विफल",
      "enter_6_digit_otp": "कृपया 6 अंकों का OTP दर्ज करें",
      "invalid_otp": "अमान्य OTP। कृपया पुनः प्रयास करें।",
      "authentication_failed": "प्रमाणीकरण विफल",
      "didnt_receive_otp": "OTP नहीं मिला?",
      "mobile_required": "मोबाइल नंबर आवश्यक है",
      "file_pick_failed": "फ़ाइल चुनने में विफल",
      "something_went_wrong": "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
      "network_error": "नेटवर्क त्रुटि। अपना कनेक्शन जांचें।",

      // प्रोफ़ाइल / खाता
      "update": "अपडेट करें",
      "update_profile": "प्रोफ़ाइल अपडेट करें",
      "update_profile_sub": "अपनी व्यक्तिगत जानकारी संपादित करें",
      "profile_updated": "प्रोफ़ाइल सफलतापूर्वक अपडेट हुई",
      "shop_name": "दुकान का नाम",
      "role_user": "उपयोगकर्ता",
      "expiring_products": "समाप्त होने वाले उत्पाद",

      // खरीद फ़ॉर्म
      "purchase": {
        "title": "खरीद रिकॉर्ड",
        "add": "खरीद जोड़ें",
        "add_title": "खरीद जोड़ें",
        "add_subtitle": "नई फसल खरीद दर्ज करें",
        "farmer": "किसान",
        "choose_farmer": "किसान चुनें",
        "crop": "फसल",
        "choose_crop": "फसल चुनें",
        "rate": "दर (₹/किलो)",
        "quantity": "मात्रा (किलो)",
        "date": "खरीद तिथि",
        "center": "खरीद केंद्र",
        "godown": "गोदाम",
        "vehicle": "वाहन संख्या",
        "remarks": "टिप्पणी",
        "details": "खरीद विवरण",
        "farmer_details": "किसान विवरण",
        "name_colon": "नाम:",
        "date_colon": "तारीख:",
        "receipt_code": "रसीद कोड:",
        "crops_purchased": "खरीदी गई फसलें",
        "no_crops_found": "कोई फसल नहीं मिली।",
        "additional_details": "अतिरिक्त विवरण",
        "center_colon": "केंद्र:",
        "godown_colon": "गोदाम:",
        "vehicle_colon": "वाहन:",
        "remarks_colon": "टिप्पणी:",
        "summary": "सारांश",
        "previous_dues": "पिछला बकाया:",
        "total_amount_colon": "कुल राशि:",
        "download_receipt": "रसीद डाउनलोड करें",
        "downloading_receipt": "रसीद डाउनलोड हो रही है...",
        "unit_quintal": "क्विंटल",
        "no_data": "कोई खरीद डेटा नहीं मिला।",
        "unknown_farmer": "अज्ञात किसान",
        "receipt_downloaded": "रसीद यहां डाउनलोड की गई: {{path}}",
        "error_missing_id": "खरीद आईडी गायब है।",
        "error_empty_data": "खरीद डेटा खाली है।",
        "error_failed_load": "खरीद विवरण लोड करने में विफल।",
        "error_failed_download": "रसीद डाउनलोड करने में विफल।"
      },
      "staff_product_details": {
        "title": "उत्पाद विवरण",
        "no_images": "कोई छवि नहीं",
        "product_info": "उत्पाद की जानकारी",
        "available_variants": "उपलब्ध वेरिएंट",
        "stock": "स्टॉक",
        "expiry": "समाप्ति",
        "variant_details": "वेरिएंट {{index}} विवरण",
        "sku_parameter": "SKU / पैरामीटर",
        "mrp": "MRP",
        "stock_quantity": "स्टॉक की मात्रा",
        "purchase_date": "खरीद की तारीख",
        "expiry_date": "समाप्ति तिथि",
        "technical_details": "तकनीकी विवरण",
        "technical_info": "तकनीकी जानकारी",
        "how_to_use": "कैसे उपयोग करें",
        "benefits": "लाभ"
      },


      // Common (समेकित)
      "common": {
        "edit": "संपादित करें",
        "delete": "हटाएं",
        "amount": "राशि",
        "date": "तारीख",
        "save": "सेव करें",
        "update": "अपडेट",
        "cancel": "रद्द करें",
        "loading": "लोड हो रहा है...",
        "not_available": "उपलब्ध नहीं"
      },

      // Common with capital-C
      "Common": {
        "amount": "राशि",
        "date": "तारीख"
      },

      "update_product": {
        "title": "उत्पाद अपडेट करें",
        "update_btn": "उत्पाद अपडेट करें",
        "updating": "अद्यतन किया जा रहा है...",
        "success": "सफलता",
        "update_success": "उत्पाद सफलतापूर्वक अपडेट किया गया!",
        "update_failed": "उत्पाद अपडेट करने में विफल। कृपया पुन: प्रयास करें।",
        "saved_badge": "सहेजा गया",
        "limit_reached": "सीमा समाप्त",
        "max_images": "अधिकतम 5 चित्र अनुमत हैं",
        "max_videos": "अधिकतम 3 वीडियो अनुमत हैं",
        "product_info": "उत्पाद की जानकारी",
        "category_crops": "श्रेणी और फसलें",
        "technical_details_title": "तकनीकी विवरण",
        "variants": "उत्पाद प्रकार",
        "variant_number": "प्रकार {{number}}",
        "video_number": "वीडियो {{number}}",
        "add_video": "वीडियो जोड़ें",
        "add_variant": "जोड़ें",
        "product_images": "उत्पाद चित्र",
        "product_images_count": "उत्पाद चित्र ({{count}}/5)",
        "product_name": "उत्पाद का नाम",
        "product_name_required": "उत्पाद का नाम *",
        "product_name_ph": "उत्पाद का नाम दर्ज करें",
        "description": "विवरण",
        "description_ph": "उत्पाद विवरण दर्ज करें",
        "brand": "ब्रांड",
        "brand_required": "ब्रांड *",
        "brand_ph": "ब्रांड का नाम दर्ज करें",
        "product_videos": "उत्पाद वीडियो",
        "product_videos_count": "उत्पाद वीडियो ({{count}}/3)",
        "product_category": "उत्पाद श्रेणी",
        "product_category_required": "उत्पाद श्रेणी *",
        "select_category": "श्रेणी चुनें",
        "target_crops": "लक्षित फसलें",
        "target_crops_ph": "उदा. गेहूं, चावल, मक्का (अल्पविराम से अलग करें)",
        "technical_details": "तकनीकी विवरण",
        "technical_details_ph": "तकनीकी विवरण दर्ज करें",
        "how_to_use": "उपयोग कैसे करें",
        "how_to_use_ph": "उपयोग के निर्देश दर्ज करें",
        "product_benefits": "उत्पाद के लाभ",
        "product_benefits_ph": "उत्पाद के लाभ दर्ज करें",
        "sku": "SKU",
        "sku_ph": "SKU दर्ज करें",
        "unit": "इकाई",
        "unit_required": "इकाई *",
        "select": "चुनें",
        "mrp": "एमआरपी",
        "mrp_required": "एमआरपी *",
        "mrp_ph": "एमआरपी दर्ज करें",
        "quantity": "मात्रा",
        "quantity_required": "मात्रा *",
        "quantity_ph": "मात्रा दर्ज करें",
        "purchase_date": "खरीद की तारीख",
        "purchase_date_required": "खरीद की तारीख *",
        "expiry_date": "समाप्ति तिथि",
        "date_ph": "YYYY-MM-DD",
        "add": "जोड़ें",
        "existing": "मौजूदा"
      },



      // Profile – logout confirm is merged into the full profile block above

    },
  },
};




