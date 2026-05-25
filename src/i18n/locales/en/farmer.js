const farmer = {
  /* ================= LOGIN ================= */

  login_title: '{{role}} Login',
  login_subtitle: 'Enter your mobile number to continue',
  mobile_number: 'Mobile Number',
  mobile_placeholder: 'Enter 10-digit mobile number',
  login_with_otp: 'Login with OTP',
  verify_and_login: 'Verify & Login',
  login_with_google: 'Login with Google',
  no_account: 'Don’t have an account?',
  register_as: 'Register as {{role}}',

  invalid_mobile_title: 'Invalid Mobile',
  invalid_mobile_message: 'Enter a valid 10-digit mobile number',

  /* ================= STEP 1 ================= */

  step_1_of_7: 'Step 1 of 7',
  personal_details: 'Personal Details',
  full_name: 'Full Name',
  enter_full_name: 'Enter your full name',
  mobile_placeholder_short: '0000000000',
  password: 'Password',
  enter_password: 'Enter password',
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  village: 'Village',
  enter_village: 'Enter village name',

  error: 'Error',
  fill_required_fields: 'Please fill all required fields',

  /* ================= STEP 2 ================= */

  step_2_of_7: 'Step 2 of 7',
  address_details: 'Address Details',
  state: 'State',
  district: 'District',
  select_state: 'Select State',
  select_district: 'Select District',
  gps_address: 'GPS Address',
  no_address_detected: 'No address detected',
  current_location: '📍 Current Location',
  latitude: 'Latitude',
  longitude: 'Longitude',
  detect_gps: 'Detect GPS Location',

  location_failed: 'Failed to get location',
  location_found: 'Location Found',
  address_not_available: 'Address not available for this location',
  permission_denied: 'Permission denied',
  location_permission_required: 'Location permission is required',
  location_error: 'Location Error',
  turn_on_location: 'Please turn ON location services',
  open_settings: 'Open Settings',

  /* STATES & DISTRICTS */

  states: [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
  ],

  districts: [
    'Pune',
    'Mumbai',
    'Nashik',
    'Nagpur',
    'Aurangabad',
    'Kolhapur',
    'Solapur',
  ],

  /* ================= STEP 3 ================= */

  step_3_of_7: 'Step 3 of 7',
  farmer_category: 'Farmer Category',
  select_farmer_category: 'Select your farming category',
  select_farmer_category_alert: 'Please select farmer category',

  farmer_small: 'Small Farmer',
  farmer_small_sub: '1–2 hectares',

  farmer_marginal: 'Marginal Farmer',
  farmer_marginal_sub: 'Less than 1 hectare',

  farmer_medium: 'Medium Farmer',
  farmer_medium_sub: '2–10 hectares',

  /* ================= STEP 4 ================= */

  step_4_of_7: 'Step 4 of 7',
  crops_grown: 'Crops Grown',
  current_year: 'Year 1 (Current)',
  enter_crop_name: 'Enter crop name',
  crop_name: 'Crop Name',
  select_crop: 'Select Crop',

  season: 'Season',
  kharif: 'Kharif',
  rabi: 'Rabi',
  zaid: 'Zaid',

  quantity_optional: 'Quantity Produced (Optional)',
  quantity_placeholder: 'e.g. 500 kg',
  select_crop_season: 'Please select crop and season',

  /* CROPS */

  crop_rice: 'Rice',
  crop_wheat: 'Wheat',
  crop_maize: 'Maize',
  crop_cotton: 'Cotton',
  crop_sugarcane: 'Sugarcane',
  crop_soybean: 'Soybean',
  crop_groundnut: 'Groundnut',

  /* ================= STEP 5 ================= */

  step_5_of_7: 'Step 5 of 7',
  land_details: 'Land Details',

  plot_id: 'Plot ID',
  plot_placeholder: 'e.g., PLOT-001',

  area_hectares: 'Area (hectares)',
  area_placeholder: 'e.g., 2.5',

  irrigation_type: 'Irrigation Type',
  soil_type: 'Soil Type',

  select_type: 'Select Type',
  select_soil: 'Select Soil',

  fill_land_details: 'Please fill all land details',

  well: 'Well',
  canal: 'Canal',
  drip: 'Drip Irrigation',
  sprinkler: 'Sprinkler Irrigation',
  rain_dependent: 'Rain Dependent',

  alluvial: 'Alluvial Soil',
  black: 'Black Soil',
  red: 'Red Soil',
  laterite: 'Laterite Soil',
  desert: 'Desert Soil',
  forest: 'Forest Soil',
  peaty: 'Peaty Soil',
  alkaline: 'Alkaline Soil',

  /* ================= STEP 6 ================= */

  step_6_of_7: 'Step 6 of 7',
  bank_details: 'Bank Details',
  bank_optional_note: 'Optional – for direct payments',

  bank_name: 'Bank Name',
  bank_name_placeholder: 'e.g., State Bank of India',

  ifsc_code: 'IFSC Code',
  ifsc_placeholder: 'e.g., SBIN0001234',

  account_number: 'Account Number',
  account_placeholder: 'Enter account number',

  /* ================= STEP 7 ================= */

  step_7_of_7: 'Step 7 of 7',

  document_upload: 'Document Upload',
  upload_supporting_documents: 'Upload supporting documents',

  upload_soil_card: 'Upload Soil Health Card',
  upload_lab_report: 'Upload Lab Report',
  upload_gov_document: 'Upload Government Scheme Document',

  complete_registration: 'Complete Registration',

  disclaimer_short:
    'This application is privately developed and is not affiliated with any government entity.',

  view_details: 'View details',
  hide_details: 'Hide details',

  disclaimer_full:
    'This application is privately developed and does not represent any government organization or authority.\n\nInformation related to government schemes or programs displayed in this application is provided solely for informational purposes and is based on publicly available sources.\n\nUsers are advised to verify all details directly through official government websites or authorized channels before submitting documents or taking any action.',

  farmer_tabs: {
    home: 'Home',
    marketplace: 'Marketplace',
    listings: 'Sell Crop',
    profile: 'My Profile',
  },

  hello_farmer: 'Hello, Farmer',
  welcome_back: 'Welcome back to Farmer Portal',
  quick_actions: 'rs',
  recent_activities: 'Recent Activities',
  see_all: 'See All',
  create_listing: 'Sell Crop',
  buy_inputs: 'Buy Inputs',
  my_profile: 'My Profile',
  documents: 'Documents',
  my_farm: 'My Farm',
  my_crop: 'My Crop',
  crop_doctor: 'Crop Doctor',
  chatbot: 'AI Assistant',
  crop_calendar: 'Crop Calendar',

  //Documents

  documents: 'Documents',
  manage_documents: 'Manage your farming documents',
  soil_health_card: 'Soil Health Card',
  soil_health_desc: 'Upload your soil health card for better recommendations',
  lab_reports: 'Lab Reports',
  lab_reports_desc: 'Crop quality and soil test reports',
  gov_documents: 'Government Scheme Documents',
  gov_documents_desc: 'PM-KISAN, scheme enrollment certificates',
  upload_document: 'Upload Document',
  reupload: 'Re-upload',
  view: 'View',
  why_upload: 'Why upload documents?',
  why_upload_desc:
    'Your documents help us verify your profile and provide better crop recommendations.',
  other_documents: 'Other Documents',
  other_documents_desc: 'Upload additional supporting documents',
  add_document: 'Add Document',
  upload_all: 'Upload All',

  marketplace: {
    title: 'Marketplace',
    subtitle: 'Buy quality inputs for your farm',
    search: 'Search products...',
    add_to_cart: 'Add to Cart',

    categories: ['All', 'Seeds', 'Fertilizers', 'Tools', 'Pesticides'],

    category: {
      all: 'All',
      seeds: 'Seeds',
      fertilizers: 'Fertilizers',
      tools: 'Tools',
      pesticides: 'Pesticides',
    },

    products: [
      {
        id: '1',
        name: 'Hybrid Tomato Seeds',
        brand: 'AgroVet Supplies',
        price: '₹450',
        unit: 'per packet',
        category: 'Seeds',
        icon: '🌱',
      },
      {
        id: '2',
        name: 'Organic Fertilizer',
        brand: 'GreenGrow Industries',
        price: '₹850',
        unit: 'per 50kg bag',
        category: 'Fertilizers',
        icon: '🌾',
      },
    ],
  },

  bank_details: 'Bank Details',
  documents: 'Documents',
  logout: 'Logout',
  edit: 'Edit',
  delete: 'Delete',

  listing: {
    my_listings: 'Sell Crop',
    total: '{{count}} total listings',
    status: {
      approved: 'Approved',
      pending: 'Pending',
      sold: 'Sold',
    },
  },
  common: {
    edit: 'Edit',
    delete: 'Delete',
    amount: 'Amount',
    date: 'Date',
    save: 'Save Entry',
  },

  create_listing: {
    title: 'Sell Crop',
    category: 'Category',
    crops: 'Crops',
    tools: 'Tools',
    cattles: 'Cattles',
    crop_info: 'Crop Information',
    tools_info: 'Tools Information',
    cattle_info: 'Cattle Information',
    crop_name: 'Crop Name',
    tool_name: 'Tool Name',
    cattle_type: 'Cattle Type',
    variety: 'Variety',
    brand_model: 'Brand/Model',
    breed: 'Breed',
    quantity: 'Quantity (kg)',
    quantity_quintal: 'Quantity (quintal)',
    quantity_tools: 'Quantity',
    quantity_cattle: 'Number of Cattle',
    price: 'Price (₹/kg)',
    price_quintal: 'Price (₹/quintal)',
    price_tools: 'Price (₹)',
    price_cattle: 'Price (₹/head)',
    location: 'Location',
    enter_location: 'Enter location',
    use_location: 'Use current location',
    upload_images: 'Upload Images',
    add: 'Add',
    submit: 'Submit Listing',
    fill_required: 'Please fill all required fields',
    submitted: 'Listing submitted successfully',
  },

  profile: {
    role_farmer: 'Farmer',
    edit_profile: 'Edit Profile',
    logout: 'Logout',
    menu: {
      personal_details: 'Personal Details',
      address_details: 'Address Details',
      farmer_category: 'Farmer Category',
      crops_grown: 'Crops Grown',
      land_details: 'Land Details',
      bank_details: 'Bank Details',
      uploaded_documents: 'Uploaded Documents',
      help_support: 'Help & Support',
    },
  },

  farmer_inquiry: {
    title: 'Inquiry',
    required: '*',
    inquiry_type_label: 'Inquiry Type',
    seeds: 'Seeds',
    fertilizers: 'Fertilizers',
    pesticides: 'Pesticides',
    tools: 'Tools',
    other: 'Other',
    product_name_label: 'Product Name',
    product_name_placeholder: 'Enter product name',
    crop_label: 'Select Crop',
    select_crop: 'Select Crop',
    search_crop: 'Search crop...',
    no_crop_found: 'No crop found.',
    enter_crop_name: 'Enter Crop Name',
    crop_name_placeholder: 'Enter crop name',
    submit_crop: 'Submit',
    quantity_label: 'Quantity',
    quantity_placeholder: 'Enter quantity',
    notes_label: 'Additional Notes',
    notes_placeholder: 'Enter any additional details',
    photo_label: 'Upload Photo',
    photo_upload: 'Upload Photo',
    photo_optional: 'Optional',
    photo_change: 'Change Photo',
    submit: 'Submit Inquiry',
    success: 'Success',
    success_msg: 'Inquiry submitted successfully',
    error: 'Error',
    error_msg: 'Failed to submit inquiry',
    select_inquiry_type: 'Please select inquiry type',
    crop_required: 'Please select crop',
    quantity_required: 'Please enter quantity',
    quantity_invalid: 'Please enter valid quantity',
    please_enter_crop_name: 'Please enter crop name',
    image_pick_error: 'Failed to pick image',
    select_unit: 'Select Unit',
  },
};
