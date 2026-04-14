const farmer = {

  /* ================= LOGIN ================= */

  login_title: "{{role}} लॉगिन",
  login_subtitle: "जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें",
  mobile_number: "मोबाइल नंबर",
  mobile_placeholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
  login_with_otp: "ओटीपी से लॉगिन करें",
  login_with_google: "गूगल से लॉगिन करें",
  no_account: "खाता नहीं है?",
  register_as: "{{role}} के रूप में पंजीकरण करें",

  invalid_mobile_title: "अमान्य मोबाइल",
  invalid_mobile_message: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें",

  /* ================= STEP 1 ================= */

  step_1_of_7: "चरण 1 / 7",
  personal_details: "व्यक्तिगत जानकारी",
  full_name: "पूरा नाम",
  enter_full_name: "अपना पूरा नाम दर्ज करें",
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

  /* ================= STEP 2 ================= */

  step_2_of_7: "चरण 2 / 7",
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

  states: [
    "आंध्र प्रदेश","अरुणाचल प्रदेश","असम","बिहार","छत्तीसगढ़",
    "गोवा","गुजरात","हरियाणा","हिमाचल प्रदेश","झारखंड",
    "कर्नाटक","केरल","मध्य प्रदेश","महाराष्ट्र","मणिपुर",
    "मेघालय","मिज़ोरम","नागालैंड","ओडिशा","पंजाब","राजस्थान",
    "सिक्किम","तमिलनाडु","तेलंगाना","त्रिपुरा","उत्तर प्रदेश",
    "उत्तराखंड","पश्चिम बंगाल","दिल्ली"
  ],

  districts: [
    "पुणे","मुंबई","नाशिक","नागपुर",
    "औरंगाबाद","कोल्हापुर","सोलापुर"
  ],

  /* ================= STEP 3 ================= */

  step_3_of_7: "चरण 3 / 7",
  farmer_category: "किसान श्रेणी",
  select_farmer_category: "अपनी खेती की श्रेणी चुनें",
  select_farmer_category_alert: "कृपया किसान श्रेणी चुनें",

  farmer_small: "छोटा किसान",
  farmer_small_sub: "1–2 हेक्टेयर",

  farmer_marginal: "सीमांत किसान",
  farmer_marginal_sub: "1 हेक्टेयर से कम",

  farmer_medium: "मध्यम किसान",
  farmer_medium_sub: "2–10 हेक्टेयर",

  /* ================= STEP 4 ================= */

  step_4_of_7: "चरण 4 / 7",
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

  crop_rice: "चावल",
  crop_wheat: "गेहूं",
  crop_maize: "मक्का",
  crop_cotton: "कपास",
  crop_sugarcane: "गन्ना",
  crop_soybean: "सोयाबीन",
  crop_groundnut: "मूंगफली",

  /* ================= STEP 5 ================= */

  step_5_of_7: "चरण 5 / 7",
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

  irrigation_canal: "नहर",
  irrigation_borewell: "बोरवेल",
  irrigation_rainfed: "वर्षा आधारित",
  irrigation_drip: "ड्रिप सिंचाई",

  soil_black: "काली मिट्टी",
  soil_red: "लाल मिट्टी",
  soil_alluvial: "जलोढ़ मिट्टी",
  soil_sandy: "रेतीली मिट्टी",

  /* ================= STEP 6 ================= */

  step_6_of_7: "चरण 6 / 7",
  bank_details: "बैंक विवरण",
  bank_optional_note: "वैकल्पिक – सीधे भुगतान के लिए",

  bank_name: "बैंक का नाम",
  bank_name_placeholder: "उदाहरण: स्टेट बैंक ऑफ इंडिया",

  ifsc_code: "आईएफएससी कोड",
  ifsc_placeholder: "उदाहरण: SBIN0001234",

  account_number: "खाता संख्या",
  account_placeholder: "खाता संख्या दर्ज करें",

  /* ================= STEP 7 ================= */

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
    "यह ऐप निजी रूप से विकसित किया गया है और किसी भी सरकारी संगठन या प्राधिकरण का प्रतिनिधित्व नहीं करता है。\n\nइस ऐप में प्रदर्शित सरकारी योजनाओं या कार्यक्रमों की जानकारी केवल सूचनात्मक उद्देश्यों के लिए है और सार्वजनिक रूप से उपलब्ध स्रोतों पर आधारित है。\n\nकृपया किसी भी दस्तावेज़ जमा करने या कार्रवाई करने से पहले आधिकारिक सरकारी वेबसाइट या अधिकृत स्रोत से जानकारी सत्यापित करें।",

"farmer_tabs": {
    "home": "होम",
    "marketplace": "मार्केट",
    "listings": "लिस्टिंग",
    "profile": "प्रोफ़ाइल"
  },


      "hello_farmer": "नमस्ते किसान",
  "welcome_back": "किसान पोर्टल में आपका स्वागत है",
 "quick_actions": "त्वरित कार्य",
  "recent_activities": "हाल की गतिविधियाँ",
  "see_all": "सभी देखें",

  "create_listing": "लिस्टिंग बनाएं",
  "buy_inputs": "इनपुट खरीदें",
  "my_profile": "मेरी प्रोफ़ाइल",
  "documents": "दस्तावेज़",
  "my_farm": "मेरा खेत",
  "my_crop": "मेरी फसल",
  "crop_doctor": "फसल डॉक्टर",
  "chatbot": "AI सहायक",
  "crop_calendar": "फसल कैलेंडर",


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


  
  "marketplace": "मार्केटप्लेस",
  "marketplace_details": {
    "title": "मार्केटप्लेस",
    "subtitle": "खेती के लिए उच्च गुणवत्ता के इनपुट खरीदें",
    "search": "उत्पाद खोजें...",
    "add_to_cart": "कार्ट में जोड़ें",

    "categories": ["All", "Seeds", "Fertilizers", "Tools", "Pesticides"],

    "category": {
      "all": "सभी",
      "seeds": "बीज",
      "fertilizers": "उर्वरक",
      "tools": "औज़ार",
      "pesticides": "कीटनाशक"
    }
  },

  "bank_details": "बैंक विवरण",
  "documents": "दस्तावेज़",
  "logout": "लॉगआउट",
  "edit": "संपादित करें",
  "delete": "हटाएं",

  "listing": {
    "my_listings": "मेरी लिस्टिंग",
    "total": "कुल {{count}} लिस्टिंग",
    "status": {
      "approved": "स्वीकृत",
      "pending": "लंबित",
      "sold": "बिक गया"
    }
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
    "title": "लिस्टिंग बनाएं",
    "crop_info": "फसल की जानकारी",
    "crop_name": "फसल का नाम",
    "variety": "किस्म",
    "quantity": "मात्रा (किलो)",
    "price": "कीमत (₹/किलो)",
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

};

export default farmer;