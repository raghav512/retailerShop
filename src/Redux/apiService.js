import axios from "axios";
import { getAccessToken, getUserData } from "./Storage";
import { API_BASE_URL } from '../config';

/* ================= AXIOS INSTANCE ================= */
export const BASE_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

console.log('🚀 API Client Base URL:', apiClient.defaults.baseURL);

/* ================= REQUEST INTERCEPTOR ================= */
apiClient.interceptors.request.use(
  async (config) => {
    console.log('📤 REQUEST:', config.method?.toUpperCase(), config.baseURL + config.url);

    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let axios handle it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error.message);
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ RESPONSE ERROR:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

/* ================= HELPERS ================= */
const getUserId = async () => {
  const user = await getUserData();
  return user?.id;
};

/* ================= API SERVICES ================= */
const apiService = {

  /* ---------- NOTIFICATION ---------- */
  sendFcmTokenToBackend: async (fcmToken) => {
    try {
      console.log('🔔 Sending FCM token to backend:', fcmToken);

      const res = await apiClient.post('/api/fcm/save-token', {
        fcmToken: fcmToken,
      });

      console.log('✅ FCM token sent successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to send FCM token:', error.message);
      throw error;
    }
  },

  /* ---------- BROADCAST ---------- */
  sendBroadcast: async (payload) => {
    try {
      console.log('📢 Sending broadcast to /api/broadcast');
      const res = await apiClient.post('/api/broadcast/send', payload, {
        timeout: 60000,
      });
      console.log('✅ Broadcast sent:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to send broadcast:', error.message);
      throw error;
    }
  },
  getAllBroadcasts: async (page = 1, limit = 20) => {
    try {
      console.log(`📢 Fetching broadcasts - page: ${page}, limit: ${limit}`);
      const res = await apiClient.get(`/api/broadcast?page=${page}&limit=${limit}`);
      console.log('✅ Broadcasts fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch broadcasts:', error.message);
      throw error;
    }
  },

  getBroadcastById: async (id) => {
    try {
      console.log(`📢 Fetching broadcast by id: ${id}`);
      const res = await apiClient.get(`/api/broadcast/${id}`);
      console.log('✅ Broadcast fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch broadcast:', error.message);
      throw error;
    }
  },



  getProfileDetails: async () => {
    try {

      const token = await getAccessToken();
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      console.log('🔍 Getting profile from:', apiClient.defaults.baseURL + '/api/user/getUserDetails');

      const response = await apiClient.get("/api/user/getUserDetails");
      console.log('✅ Profile response status:', response.status);
      console.log('✅ Profile response data:', JSON.stringify(response.data, null, 2));
      console.log('✅ Returning:', response?.data?.data);

      return response?.data?.data;
    } catch (error) {
      console.error("❌ Get profile error:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      // Network-specific error messages
      if (error.message === 'Network Error') {
        console.error("\n⚠️  NETWORK ERROR TROUBLESHOOTING:");
        console.error("1. Check if backend server is running on", apiClient.defaults.baseURL);
        console.error("2. For Android Emulator, use: http://10.0.2.2:9000");
        console.error("3. For Physical Device, ensure same WiFi network");
        console.error("4. Check Windows Firewall allows port 9000");
        console.error("5. Verify backend is listening on 0.0.0.0:9000 (not localhost)");
      }

      throw error;
    }
  },


  UpdateProfileData: async (data) => {
    try {
      console.log('🔄 Updating profile at:', apiClient.defaults.baseURL + '/api/user/update-profile');
      console.log('📝 Data type:', data instanceof FormData ? 'FormData' : 'JSON');

      const config = {
        timeout: 300000, // 5 minutes for uploads
      };

      if (!(data instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await apiClient.put("/api/user/update-profile", data, config);
      console.log('✅ Profile update response:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Profile update error:', error.message);
      console.error('Update URL:', apiClient.defaults.baseURL + '/api/user/update-profile');
      throw error;
    }
  },

  uploadDocuments: async (formData) => {
    try {
      console.log('📄 Uploading documents...');
      const response = await apiClient.put("/api/user/update-profile", formData, {
        timeout: 300000,
      });
      console.log('✅ Documents uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Document upload error:', error.message);
      throw error;
    }
  },



  /* ---------- CROP LISTING ---------- */
  addCropListing: async (formData) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Login required");
      formData.append("userId", userId);
      const response = await apiClient.post("/api/crop-listing/add", formData, {
        timeout: 300000, // 5 minutes for image uploads
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCropListings: async () => {
    const res = await apiClient.get("/api/crop-listing/getListings");
    return res.data;
  },

  getUserCropListings: async () => {
    const res = await apiClient.get("/api/crop-listing/getListingsByUser");
    return res.data;
  },

  updateCropListing: async (id, data) => {
    const userId = await getUserId();
    const res = await apiClient.put(`/api/crop-listing/update/${id}`, {
      ...data,
      userId,
    });
    return res.data;
  },

  deleteCropListing: async (id) => {
    const userId = await getUserId();
    const res = await apiClient.delete(`/api/crop-listing/delete/${id}`, {
      data: { userId },
    });
    return res.data;
  },

  /* ---------- REGISTRATION ---------- */
  FarmerRegister: async (payload) => {
    try {
      const response = await apiClient.post("/api/user/register", payload);
      return response.data;
    } catch (error) {
      console.error("Farmer registration failed", error.message);
      throw error;
    }
  },

  StafRegister: async (payload) => {
    const response = await apiClient.post("/api/user/register", payload);
    return response.data;
  },

  FPORegister: async (payload) => {
    const response = await apiClient.post("/api/user/register", payload);
    return response.data;
  },

  /* ---------- PRODUCTS ---------- */
  FPOproduct: async (payload) => {
    const res = await apiClient.post("/api/product/addProduct", payload, {
      timeout: 300000, // 5 minutes — needed for large base64 video payloads
    });
    return res.data;
  },

  updateProduct: async (id, payload) => {
    const res = await apiClient.put(`/api/product/updateProduct/${id}`, payload, {
      timeout: 300000, // 5 minutes — needed for large base64 video payloads
    });
    return res.data;
  },

  deleteProduct: async (id) => {
    try {
      const res = await apiClient.delete(`/api/product/deleteProduct/${id}`);
      return res.data;
    } catch (error) {
      console.error('❌ deleteProduct error:', error.message);
      throw error;
    }
  },

  /* ---------- ADVERTISEMENT ---------- */
  getAdvertisementPosters: async () => {
    try {
      console.log('📢 Fetching advertisement posters');
      const res = await apiClient.get('/api/advertisement-posters');
      console.log('✅ Advertisement posters fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch advertisement posters:', error.message);
      throw error;
    }
  },

  /* ---------- ADMIN FILES ---------- */
  getAdminPrivateFiles: async (type, userId) => {
    try {
      console.log(`📁 Fetching admin private files - type: ${type}, userId: ${userId}`);
      const res = await apiClient.get(`/api/admin/files/private?type=${type}&userId=${userId}`);
      console.log('✅ Admin private files fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch admin private files:', error.message);
      throw error;
    }
  },

  toggleProductStatus: async (id) => {
    try {
      const res = await apiClient.put(`/api/product/toggleProductStatus/${id}`);
      return res.data;
    } catch (error) {
      console.error('❌ toggleProductStatus error:', error.message);
      throw error;
    }
  },

  GetFPOProduct: async () => {
    const res = await apiClient.get("/api/product/getProducts");
    return res?.data?.data;
  },

  /* ---------- STAFF ---------- */
  Stafproduct: async (payload) => {
    const res = await apiClient.post("/api/purchase/addPurchase", payload);
    return res.data;
  },

  GetStaffPurches: async () => {
    const res = await apiClient.get("/api/purchase/getPurchases");
    return res?.data?.data;
  },

  getPurchaseById: async (id) => {
    const res = await apiClient.get(`/api/purchase/getPurchaseById/${id}`);
    return res.data;
  },

  downloadPurchaseReceipt: async (receiptId) => {
    const token = await getAccessToken();
    const url = `${BASE_URL}/api/purchase/receipt/${receiptId}`;
    return { url, token };
  },

  getAllFarmers: async () => {
    const res = await apiClient.get("/api/user/getAllFarmers");
    return res?.data?.data;
  },

  //farmer
  GetMarketplaceItems: async () => {
    const res = await apiClient.get("/api/marketplace/items");
    return res.data;
  },

  /* ---------- CART ---------- */
  applyCoupon: async (payload) => {
    console.log("🎟️ APPLY COUPON - Payload:", payload);
    const res = await apiClient.post("/api/cart/apply-coupon", payload);
    console.log("✅ APPLY COUPON - Response:", JSON.stringify(res.data, null, 2));
    return res.data;
  },

  addToCart: async (payload) => {
    console.log("📦 ADD TO CART - Payload:", JSON.stringify(payload, null, 2));
    const res = await apiClient.post("/api/cart/add", payload);
    console.log("✅ ADD TO CART - Response:", JSON.stringify(res.data, null, 2));
    return res.data;
  },

  getCart: async () => {
    try {
      const res = await apiClient.get("/api/cart/get-cart");
      console.log("📦 CART - Full response:", JSON.stringify(res.data, null, 2));
      return res.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.log("⚠️ Cart empty or not initialized, returning empty cart");
        return { success: true, data: { items: [] } };
      }
      throw error;
    }
  },

  updateCart: async (payload) => {
    console.log("🔄 UPDATE - Payload:", payload);
    const res = await apiClient.put("/api/cart/update", payload);
    console.log("✅ UPDATE - Response:", JSON.stringify(res.data, null, 2));
    return res.data;
  },

  deleteCartItem: async (itemId) => {
    console.log("🗑️ DELETE - Item ID:", itemId);
    const res = await apiClient.delete(`/api/cart/remove/${itemId}`);
    console.log("✅ DELETE - Response:", JSON.stringify(res.data, null, 2));
    return res.data;
  },

  clearCart: async () => {
    const res = await apiClient.delete("/api/cart/remove-all");
    return res.data;
  },

  placeOrder: async (paymentMethod = "cash") => {
    const res = await apiClient.post("/api/order/place", { paymentMethod });
    return res.data;
  },

  downloadReceipt: async (receiptId) => {
    const token = await getAccessToken();
    const url = `${BASE_URL}/api/order/downloadReceipt/${receiptId}`;
    return { url, token };
  },

  getAllReceipts: async () => {
    const res = await apiClient.get("/api/order/allReceipts");
    return res.data;
  },

  getAllOrders: async () => {
    const res = await apiClient.get("/api/order/allOrders");
    return res.data;
  },

  /* ---------- FARM ---------- */
  addFarm: async (payload) => {
    console.log('🌾 Adding farm with payload:', JSON.stringify(payload, null, 2));
    const res = await apiClient.post("/api/farm/addFarm", payload);
    return res.data;
  },

  updateFarmById: async (id, payload) => {
    const res = await apiClient.put(`/api/farm/updateFarmById/${id}`, payload);
    return res.data;
  },

  deleteFarmById: async (id) => {
    const res = await apiClient.delete(`/api/farm/deleteFarmById/${id}`);
    return res.data;
  },

  getFarmByFarmId: async (id) => {
    const res = await apiClient.get(`/api/farm/getFarmByFarmId/${id}`);
    return res.data;
  },

  getFarmsByUserId: async (id) => {
    const res = await apiClient.get(`/api/farm/getFarmsByUserId/${id}`);
    return res.data;
  },

  getAllFarms: async () => {
    const res = await apiClient.get("/api/farm/getAllFarms");
    return res.data;
  },

  /* ---------- CROP ---------- */
  addCrop: async (payload) => {
    const res = await apiClient.post("/api/crop/addCrop", payload);
    return res.data;
  },

  updateCropById: async (id, payload) => {
    const res = await apiClient.put(`/api/crop/updateCrop/${id}`, payload);
    return res.data;
  },

  deleteCropById: async (id) => {
    const res = await apiClient.delete(`/api/crop/deleteCrop/${id}`);
    return res.data;
  },

  getUserCropsByUserId: async () => {
    const res = await apiClient.get("/api/crop/getCropsByUser");
    return res.data;
  },

  getAllCrops: async () => {
    const res = await apiClient.get("/api/crop/getAllCrops");
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await apiClient.get(`/api/order/getOrderById/${id}`);
    return res.data;
  },

  updateOrderPrices: async (id, payload) => {
    try {
      console.log("🔄 Updating order prices:", id, payload);
      const response = await apiClient.patch(`/api/order/${id}/update-prices`, payload);
      console.log("✅ Order prices updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ updateOrderPrices error:", error.response?.data || error.message);
      throw error;
    }
  },

  updateOrderStatus: async (id, payload) => {
    try {
      if (!id) {
        throw new Error("Order ID is required");
      }

      const status = typeof payload === "string" ? payload : payload.status;

      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        throw new Error("Invalid order status");
      }

      console.log("🔄 Updating order status:", id, payload);

      const requestBody = typeof payload === "string" ? { status } : payload;

      const response = await apiClient.put(
        `/api/order/updateOrderStatus/${id}`,
        requestBody
      );

      console.log("✅ Order status updated:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ updateOrderStatus error:", error.response?.data || error.message);
      throw error;
    }
  },

  /* ---------- OTP ---------- */
  SendOtp: async (payload) => {
    if (payload.role) {
      payload.role = payload.role.toLowerCase() === 'fpo' 
        ? 'FPO' 
        : payload.role.charAt(0).toUpperCase() + payload.role.slice(1).toLowerCase();
    }
    const res = await apiClient.post("/api/otp/send-otp", payload);
    return res.data;
  },

  /* ---------- Verify OTP ---------- */
  SendVerifyOtp: async (payload) => {
    if (payload.role) {
      payload.role = payload.role.toLowerCase() === 'fpo' 
        ? 'FPO' 
        : payload.role.charAt(0).toUpperCase() + payload.role.slice(1).toLowerCase();
    }
    const res = await apiClient.post("/api/otp/verify-otp", payload);
    return res.data;
  },

  saveFcmToken: async (data) => {
    const res = await apiClient.post("/api/fcm/save-token", data);
    console.log("✅ saveFcmToken response:", res.data);
    return res.data;
  },

  MyOrders: async () => {
    const res = await apiClient.get("/api/order/myOrders");
    return res.data.data;   // ✅ return only orders array
  },

  getExpiringProducts: async () => {
    const res = await apiClient.get("/api/product/expiringProducts");
    return res.data;
  },

  /* ---------- PRIVATE FILES ---------- */
  getPrivateFiles: async (type) => {
    try {
      console.log(`📂 Fetching private files of type: ${type}`);
      const res = await apiClient.get(`/api/user/files/private?type=${type}`);
      console.log("✅ Private files fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ getPrivateFiles error:", error.message);
      throw error;
    }
  },

  /* ---------- CROP DOCTOR ---------- */
  saveReport: async (payload) => {
    const res = await apiClient.post("/api/crop-doctor/saveReport", payload);
    return res.data;
  },

  getUserReports: async (userId) => {
    try {
      const res = await apiClient.get(`/api/crop-doctor/getUserReports/${userId}`);
      return res.data;
    } catch (error) {
      // If 404, return empty array (no reports yet)
      if (error.response?.status === 404) {
        console.log('No reports found for user, returning empty array');
        return { status: 'success', data: [] };
      }
      throw error;
    }
  },

  getReportById: async (reportId) => {
    const res = await apiClient.get(`/api/crop-doctor/getReportById/${reportId}`);
    return res.data;
  },

  deleteReport: async (reportId) => {
    const res = await apiClient.delete(`/api/crop-doctor/deleteReport/${reportId}`);
    return res.data;
  },

  /* ---------- CROP CALENDAR ---------- */
  getAllCropsCalendar: async () => {
    const res = await apiClient.get("/api/crop-calendar/");
    return res.data;
  },

  getCropCalendarByName: async (cropName) => {
    const res = await apiClient.get(`/api/crop-calendar/${cropName}`);
    return res.data;
  },

  getCropCalendarById: async (cropId) => {
    const res = await apiClient.get(`/api/crop/${cropId}/calendar`);
    return res.data;
  },

  /* ---------- MANDI PRICES ---------- */
  getMandiPrices: async (state, district, commodity) => {
    try {
      const url = `/api/mandi/prices?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(commodity)}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ No mandi prices found (404), returning empty list');
        return { data: [] };
      }
      console.error('❌ getMandiPrices error:', error.message);
      throw error;
    }
  },

};

export default apiService;
