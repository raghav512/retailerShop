const Distributor = {
  /* ================= Distributor LOGIN ================= */

  fpo_login: 'Distributor Login',
  fpo_login_subtitle: 'Login with GST number or mobile',

  gst_number: 'GST Number',
  enter_gst: 'Enter GST Number',

  mobile_number: 'Mobile Number',
  enter_mobile: 'Enter 10-digit mobile number',

  login: 'Login',
  please_wait: 'Please wait...',

  dont_have_account: "Don't have an account?",
  register_as_fpo: 'Register as Distributor',

  login_failed: 'Login Failed',
  invalid_credentials: 'Invalid credentials',

  /* ================= Distributor REGISTRATION ================= */

  fpo_registration: 'Distributor Registration',
  fpo_registration_sub: 'Create your retailer account',

  back_to_login: 'Back to Login',

  first_name: 'First Name',
  enter_first_name: 'Enter your first name',

  last_name: 'Last Name',
  enter_last_name: 'Enter your last name',

  email: 'Email',
  enter_email: 'Enter your email',

  phone_number: 'Phone Number',
  enter_phone: 'Enter your phone number',

  state: 'State',
  select_state: 'Select state',

  district: 'District',
  select_district: 'Select district',

  village: 'Village',
  select_village: 'Select village',

  register: 'Register',

  error: 'Error',
  success: 'Success',
  fill_required_fields: 'Please fill all required fields',
  registration_submitted: 'Registration submitted successfully',

  /* ================= LOCATION DATA ================= */

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

  villages: ['Village A', 'Village B', 'Village C', 'Village D', 'Village E'],

  // Distributor tabs

  tabs: {
    home: 'Home',
    farmers: 'Farmers',
    inventory: 'Inventory',
    profile: 'Profile',
  },

  //Distributor pages

  fpo_dashboard: 'Distributor Dashboard',
  manage_farmers: 'Manage farmers and operations',

  total_farmers: 'Total Farmers',
  active_fields: 'Active Fields',
  pending_payments: 'Pending Payments',

  quick_actions: 'Quick Action',
  crop_statistics: 'Crop Statistics',

  add_farmer: 'Add Farmer',
  order_details: 'Order Details',
  farmer_listing: 'Farmer Listing',
  all_tasks: 'All Tasks',
  Community: 'Community',
  inquiry: 'Inquiry',
  ledger: 'Ledger',

  wheat: 'Wheat',
  rice: 'Rice',
  cotton: 'Cotton',
  others: 'Others',

  //Ladger

  ledger: 'Ledger',
  ledger_date: '{{date}}',

  pending_payments: 'Pending Payments',
  completed_today: 'Completed Today',
  paid_this_month: 'Total Paid This Month',

  download_ledger: 'Download Ledger',
  urgent: 'Urgent',
  due: 'Due',
  today: 'Today',
  mark_paid: 'Mark as Paid',

  farmer_management: 'Farmer Management',
  farmer_management_sub: 'Master records & verification',
  search_farmers: 'Search farmers...',

  filter: {
    all: 'All',
    verified: 'Verified',
    pending: 'Pending',
  },

  status: {
    verified: 'Verified',
    pending: 'Pending',
  },

  fields: 'fields',
  view_details: 'View Details',

  // Inventory

  inventory: {
    title: 'Inventory & Inputs',
    add_product: 'Add Product',
    brand: 'Brand',
    mrp: 'MRP',
    update: 'Update',
    status: {
      in: 'In Stock',
      low: 'Low Stock',
    },
  },

  profile: {
    edit: 'Edit Profile',
    account_details: 'Account Details',
    account: {
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
    },
    features: {
      field_crop_mapping: {
        title: 'Field & Crop Mapping',
        sub: 'Land and crop overview',
      },
      schemes_subsidies: {
        title: 'Schemes & Subsidies',
        sub: 'Government programs',
      },
    },
    settings: {
      notifications: 'Notifications',
      language: 'Language',
      privacy: 'Privacy & Security',
      help: 'Help & Support',
      logout: 'Logout',
    },
    app_name: 'KrishiGyan Distributor App',
  },
  
  fpo_profile: {
    title: 'My Profile',
    edit: 'Edit',
    account_details: 'Account Details',
    features_title: 'Features',
    account: {
      phone: 'Phone Number',
      email: 'Email Address',
      shop: 'Shop Name',
    },
    features: {
      documents: {
        title: 'Documents',
        sub: 'Licenses and certificates',
      },
    },
    settings: {
      title: 'Settings',
      notifications: 'Notifications',
      language: 'Language',
      privacy: 'Privacy Policy',
      help: 'Help & Support',
      logout: 'Logout',
      logout_msg: 'Are you sure you want to logout?',
      cancel: 'Cancel',
    },
  },
  
  role: {
    farmer: 'Farmer',
    staff: 'Staff',
    retailer: 'Retailer',
    distributor: 'Distributor',
  },
  field_mapping: {
    title: 'Field & Crop Mapping',
    subtitle: 'Land and crop overview',
    area: 'Area',
    crop: 'Crop',
    status: 'Status',
    status_growing: 'Growing',
    status_harvesting: 'Harvesting',
  },

  // schemessubside

  schemes: {
    title: 'Schemes & Subsidies',
    subtitle: 'Government programs',
    enrolled: 'Enrolled',
    amount: 'Subsidy Amount',
  },
};

export default Distributor;
