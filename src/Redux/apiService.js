import axios from 'axios';
import { getAccessToken, getUserData } from './Storage';
import { API_BASE_URL } from '../config';
import { toOtpApiRole } from '../utils/otpRole';

/* ================= AXIOS INSTANCE ================= */
export const BASE_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const api = apiClient;

console.log('🚀 API Client Base URL:', apiClient.defaults.baseURL);

/* ================= REQUEST INTERCEPTOR ================= */
apiClient.interceptors.request.use(
  async config => {
    console.log(
      '📤 REQUEST:',
      config.method?.toUpperCase(),
      config.baseURL + config.url,
    );

    // ========== STEP 3: AXIOS REQUEST TRACE ==========
    if (config.url === '/api/order/place') {
      console.log('========== AXIOS TRACE ==========');
      console.log('METHOD:', config.method);
      console.log('URL:', config.url);
      console.log('AXIOS DATA:', JSON.stringify(config.data, null, 2));
      console.log('AXIOS paymentMethod:', config?.data?.paymentMethod);
      console.log('==================================');
    }

    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure multipart header for React Native FormData
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      console.log(
        '📤 FormData detected - Content-Type set to multipart/form-data',
      );
      console.log(
        '📤 FormData keys:',
        typeof config.data.keys === 'function'
          ? Array.from(config.data.keys())
          : 'unavailable',
      );
    }

    return config;
  },
  error => {
    console.error('❌ REQUEST ERROR:', error.message);
    return Promise.reject(error);
  },
);

/* ================= RESPONSE INTERCEPTOR ================= */
apiClient.interceptors.response.use(
  response => {
    console.log('✅ RESPONSE:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ RESPONSE ERROR:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

/* ================= HELPERS ================= */
const getUserId = async () => {
  const user = await getUserData();
  return user?.id;
};

const normalizeOtpRole = role => {
  const canonicalRole = toOtpApiRole(role);
  if (canonicalRole) {
    return canonicalRole;
  }

  const rawRole = role?.toString().trim();
  return rawRole || '';
};

/* ================= API SERVICES ================= */
const apiService = {
  /* ---------- LOGOUT ---------- */
  logoutUser: async () => {
    try {
      console.log('🔓 Calling backend logout API...');
      const res = await apiClient.post('/api/user/logout');
      console.log(
        '✅ Backend logout successful - FCM token removed:',
        res.data,
      );
      return res.data;
    } catch (error) {
      console.error('❌ Backend logout failed:', error.message);
      throw error;
    }
  },

  /* ---------- NOTIFICATION ---------- */
  sendFcmTokenToBackend: async fcmToken => {
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
  sendBroadcast: async payload => {
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
      console.log('\n📡 ========== API SERVICE: GET ALL BROADCASTS ==========');
      console.log(`📄 Requesting: page=${page}, limit=${limit}`);
      console.log(
        `🔗 URL: ${apiClient.defaults.baseURL}/api/broadcast?page=${page}&limit=${limit}`,
      );

      // Check if token exists
      const token = await getAccessToken();
      console.log('🔑 Token exists:', !!token);
      if (token) {
        console.log('🔑 Token preview:', token.substring(0, 30) + '...');
      }

      const res = await apiClient.get(
        `/api/broadcast?page=${page}&limit=${limit}`,
      );

      console.log('\n✅ API RESPONSE RECEIVED:');
      console.log('Status:', res.status);
      console.log('Success:', res.data?.success);
      console.log('Data Count:', res.data?.data?.length || 0);
      console.log('Pagination:', JSON.stringify(res.data?.pagination, null, 2));
      console.log('\nFull Response Data:');
      console.log(JSON.stringify(res.data, null, 2));
      console.log('📡 ========== END API SERVICE ==========\n');

      return res.data;
    } catch (error) {
      console.error('\n❌ ========== API SERVICE ERROR ==========');
      console.error('Error Message:', error.message);
      console.error('Error Code:', error.code);
      console.error('Response Status:', error.response?.status);
      console.error(
        'Response Data:',
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error('Request URL:', error.config?.url);
      console.error('❌ ========================================\n');
      throw error;
    }
  },

  getBroadcastById: async id => {
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
      console.log(
        '🔍 Token preview:',
        token ? token.substring(0, 20) + '...' : 'none',
      );
      console.log(
        '🔍 Getting profile from:',
        apiClient.defaults.baseURL + '/api/user/getUserDetails',
      );

      const response = await apiClient.get('/api/user/getUserDetails');
      console.log('✅ Profile response status:', response.status);
      console.log(
        '✅ Profile response data:',
        JSON.stringify(response.data, null, 2),
      );
      console.log('✅ Returning:', response?.data?.data);

      return response?.data?.data;
    } catch (error) {
      console.error('❌ Get profile error:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);

      // Network-specific error messages
      if (error.message === 'Network Error') {
        console.error('\n⚠️  NETWORK ERROR TROUBLESHOOTING:');
        console.error(
          '1. Check if backend server is running on',
          apiClient.defaults.baseURL,
        );
        console.error('2. For Android Emulator, use: http://10.0.2.2:9000');
        console.error('3. For Physical Device, ensure same WiFi network');
        console.error('4. Check Windows Firewall allows port 9000');
        console.error(
          '5. Verify backend is listening on 0.0.0.0:9000 (not localhost)',
        );
      }

      throw error;
    }
  },

  UpdateProfileData: async data => {
    try {
      console.log(
        '🔄 Updating profile at:',
        apiClient.defaults.baseURL + '/api/user/update-profile',
      );
      console.log(
        '📝 Data type:',
        data instanceof FormData ? 'FormData' : 'JSON',
      );

      const config = {
        timeout: 300000, // 5 minutes for uploads
      };

      if (!(data instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await apiClient.put(
        '/api/user/update-profile',
        data,
        config,
      );
      console.log('✅ Profile update response:', response.status);
      return response.data;
    } catch (error) {
      console.error('❌ Profile update error:', error.message);
      console.error(
        'Update URL:',
        apiClient.defaults.baseURL + '/api/user/update-profile',
      );
      throw error;
    }
  },

  uploadDocuments: async formData => {
    try {
      console.log('📄 Uploading documents...');
      const response = await apiClient.put(
        '/api/user/update-profile',
        formData,
        {
          timeout: 300000,
        },
      );
      console.log('✅ Documents uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Document upload error:', error.message);
      throw error;
    }
  },

  /* ---------- CROP LISTING ---------- */
  addCropListing: async formData => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error('Login required');
      formData.append('userId', userId);
      const response = await apiClient.post('/api/crop-listing/add', formData, {
        timeout: 300000, // 5 minutes for image uploads
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCropListings: async () => {
    const res = await apiClient.get('/api/crop-listing/getListings');
    return res.data;
  },

  getUserCropListings: async () => {
    const res = await apiClient.get('/api/crop-listing/getListingsByUser');
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

  deleteCropListing: async id => {
    const userId = await getUserId();
    const res = await apiClient.delete(`/api/crop-listing/delete/${id}`, {
      data: { userId },
    });
    return res.data;
  },

  /* ---------- REGISTRATION ---------- */
  FarmerRegister: async payload => {
    try {
      const response = await apiClient.post('/api/user/register', payload);
      return response.data;
    } catch (error) {
      console.error('Farmer registration failed', error.message);
      throw error;
    }
  },

  StafRegister: async payload => {
    const response = await apiClient.post('/api/user/register', payload);
    return response.data;
  },

  FPORegister: async payload => {
    const response = await apiClient.post('/api/user/register', payload);
    return response.data;
  },

  /* ---------- PRODUCTS ---------- */
  FPOproduct: async payload => {
    const res = await apiClient.post('/api/product/addProduct', payload, {
      timeout: 300000, // 5 minutes — needed for large base64 video payloads
    });
    return res.data;
  },

  updateProduct: async (id, payload) => {
    const res = await apiClient.put(
      `/api/product/updateProduct/${id}`,
      payload,
      {
        timeout: 300000, // 5 minutes — needed for large base64 video payloads
      },
    );
    return res.data;
  },

  deleteProduct: async id => {
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
      console.log(
        `📁 Fetching admin private files - type: ${type}, userId: ${userId}`,
      );
      const res = await apiClient.get(
        `/api/admin/files/private?type=${type}&userId=${userId}`,
      );
      console.log('✅ Admin private files fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch admin private files:', error.message);
      throw error;
    }
  },

  toggleProductStatus: async id => {
    try {
      const res = await apiClient.put(`/api/product/toggleProductStatus/${id}`);
      return res.data;
    } catch (error) {
      console.error('❌ toggleProductStatus error:', error.message);
      throw error;
    }
  },

  GetFPOProduct: async () => {
    const res = await apiClient.get('/api/product/getProducts');
    return res?.data?.data;
  },

  /* ---------- STAFF ---------- */
  Stafproduct: async payload => {
    const res = await apiClient.post('/api/purchase/addPurchase', payload);
    return res.data;
  },

  GetStaffPurches: async () => {
    try {
      const res = await apiClient.get('/api/purchase/getPurchases');
      return res?.data?.data || [];
    } catch (error) {
      if (error.message === 'Network Error') {
        return [];
      }
      throw error;
    }
  },

  getPurchaseById: async id => {
    const res = await apiClient.get(`/api/purchase/getPurchaseById/${id}`);
    return res.data;
  },

  downloadPurchaseReceipt: async receiptId => {
    const token = await getAccessToken();
    const url = `${BASE_URL}/api/purchase/receipt/${receiptId}`;
    return { url, token };
  },

  getAllFarmers: async () => {
    try {
      console.log('📋 API: Fetching all farmers from /api/user/getAllFarmers');
      const res = await apiClient.get('/api/user/getAllFarmers');
      console.log(
        '✅ API: Farmers response:',
        JSON.stringify(res.data, null, 2),
      );

      // Handle different response structures
      if (res.data?.data) {
        return res.data.data;
      } else if (Array.isArray(res.data)) {
        return res.data;
      } else {
        return res?.data?.data || [];
      }
    } catch (error) {
      console.error('❌ API: getAllFarmers error:', error.message);
      throw error;
    }
  },

  //farmer
  GetMarketplaceItems: async () => {
    const res = await apiClient.get('/api/marketplace/items');
    console.log('📦 Marketplace items response:', res.data);
    return res.data;
  },

  /* ---------- CART ---------- */
  applyCoupon: async payload => {
    console.log('🎟️ APPLY COUPON - Payload:', payload);
    const res = await apiClient.post('/api/cart/apply-coupon', payload);
    console.log(
      '✅ APPLY COUPON - Response:',
      JSON.stringify(res.data, null, 2),
    );
    return res.data;
  },

  addToCart: async payload => {
    console.log('📦 ADD TO CART - Payload:', JSON.stringify(payload, null, 2));
    const config = payload?.farmerId
      ? { params: { farmerId: payload.farmerId } }
      : undefined;
    const res = await apiClient.post('/api/cart/add', payload, config);
    console.log(
      '✅ ADD TO CART - Response:',
      JSON.stringify(res.data, null, 2),
    );
    return res.data;
  },

  getCart: async farmerId => {
    try {
      const config = farmerId ? { params: { farmerId } } : undefined;
      const res = await apiClient.get('/api/cart/get-cart', config);
      console.log(
        '📦 CART - Full response:',
        JSON.stringify(res.data, null, 2),
      );
      return res.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('⚠️ Cart empty or not initialized, returning empty cart');
        return { success: true, data: { items: [] } };
      }
      throw error;
    }
  },

  updateCart: async payload => {
    console.log('🔄 UPDATE - Payload:', payload);
    const res = await apiClient.put('/api/cart/update', payload);
    console.log('✅ UPDATE - Response:', JSON.stringify(res.data, null, 2));
    return res.data;
  },

  deleteCartItem: async (itemId, farmerId) => {
    console.log('🗑️ DELETE - Item ID:', itemId);
    const config = farmerId ? { params: { farmerId } } : undefined;
    const res = await apiClient.delete(`/api/cart/remove/${itemId}`, config);
    console.log('✅ DELETE - Response:', JSON.stringify(res.data, null, 2));
    return res.data;
  },

  clearCart: async farmerId => {
    const config = farmerId ? { params: { farmerId } } : undefined;
    const res = await apiClient.delete('/api/cart/remove-all', config);
    return res.data;
  },

  placeOrder: async (payload = { paymentMethod: 'cash' }) => {
    // ========== STEP 2: API SERVICE TRACE ==========
    console.log('========== API SERVICE TRACE ==========');
    console.log('REQUEST URL:', '/api/order/place');

    // Handle both old format (string) and new format (object)
    const requestData =
      typeof payload === 'string' ? { paymentMethod: payload } : payload;

    console.log('REQUEST BODY:', JSON.stringify(requestData, null, 2));
    console.log('paymentMethod:', requestData?.paymentMethod);
    console.log(
      'itemImages:',
      requestData?.itemImages ? 'Present' : 'Not present',
    );
    console.log('======================================');

    const appendFormField = (formData, key, value) => {
      if (value === undefined || value === null) {
        return;
      }
      if (typeof value === 'string') {
        formData.append(key, value);
        return;
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, String(value));
        return;
      }
      formData.append(key, JSON.stringify(value));
    };

    const placeOrderConfig = requestData?.farmerId
      ? { params: { farmerId: requestData.farmerId } }
      : undefined;

    // If itemImages are present, use FormData
    if (
      requestData.itemImages &&
      Object.keys(requestData.itemImages).length > 0
    ) {
      const formData = new FormData();

      Object.entries(requestData).forEach(([key, value]) => {
        if (key === 'itemImages') {
          return;
        }
        appendFormField(formData, key, value);
      });

      // Add images for each item
      Object.entries(requestData.itemImages).forEach(([itemId, imageData]) => {
        if (imageData.base64) {
          formData.append(`itemImages[${itemId}]`, imageData.base64);
        }
      });

      console.log('Using FormData for image upload');
      const formConfig = {
        timeout: 300000,
        ...(placeOrderConfig || {}),
      };
      const res = await apiClient.post(
        '/api/order/place',
        formData,
        formConfig,
      );

      console.log('========== API SERVICE RESPONSE ==========');
      console.log('Response Status:', res.status);
      console.log('Response Data:', JSON.stringify(res.data, null, 2));
      console.log('===========================================');

      return res.data;
    } else {
      // Use JSON for orders without images
      const res = await apiClient.post(
        '/api/order/place',
        requestData,
        placeOrderConfig,
      );

      console.log('========== API SERVICE RESPONSE ==========');
      console.log('Response Status:', res.status);
      console.log('Response Data:', JSON.stringify(res.data, null, 2));
      console.log('===========================================');

      return res.data;
    }
  },

  downloadReceipt: async receiptId => {
    // ========== STEP 6: RECEIPT DOWNLOAD TRACE ==========
    console.log('========== RECEIPT DOWNLOAD TRACE ==========');
    console.log('Receipt ID:', receiptId);

    const token = await getAccessToken();
    const url = `${BASE_URL}/api/order/downloadReceipt/${receiptId}`;

    console.log('🧭 [downloadReceipt] preparing download request:', {
      receiptId,
      url,
      hasToken: !!token,
    });
    console.log('=============================================');

    return { url, token };
  },

  getAllReceipts: async () => {
    // ========== STEP 6: GET ALL RECEIPTS TRACE ==========
    console.log('========== GET ALL RECEIPTS TRACE ==========');

    const res = await apiClient.get('/api/order/allReceipts');

    console.log('All Receipts Response:', JSON.stringify(res.data, null, 2));
    if (res.data?.data && res.data.data.length > 0) {
      console.log(
        'First Receipt Sample:',
        JSON.stringify(res.data.data[0], null, 2),
      );
      console.log(
        'First Receipt Payment Method:',
        res.data.data[0]?.paymentMethod,
      );
    }
    console.log('=============================================');

    return res.data;
  },

  getAllOrders: async () => {
    const res = await apiClient.get('/api/order/allOrders');
    console.log('========== GET ALL ORDERS TRACE ==========');
    console.log('All Orders Response:', JSON.stringify(res.data, null, 2));
    if (res.data?.data && res.data.data.length > 0) {
      console.log(
        'First Order Sample:',
        JSON.stringify(res.data.data[0], null, 2),
      );
    }
    console.log('==========================================');
    console.log('GET ALL ORDERS:', {
      count: res?.data?.data?.length || 0,
    });
    return res.data;
  },

  /* ---------- FARM ---------- */
  addFarm: async payload => {
    console.log(
      '🌾 Adding farm with payload:',
      JSON.stringify(payload, null, 2),
    );
    const res = await apiClient.post('/api/farm/addFarm', payload);
    return res.data;
  },

  updateFarmById: async (id, payload) => {
    const res = await apiClient.put(`/api/farm/updateFarmById/${id}`, payload);
    return res.data;
  },

  deleteFarmById: async id => {
    const res = await apiClient.delete(`/api/farm/deleteFarmById/${id}`);
    return res.data;
  },

  getFarmByFarmId: async id => {
    const res = await apiClient.get(`/api/farm/getFarmByFarmId/${id}`);
    return res.data;
  },

  getFarmsByUserId: async id => {
    const res = await apiClient.get(`/api/farm/getFarmsByUserId/${id}`);
    return res.data;
  },

  getAllFarms: async () => {
    const res = await apiClient.get('/api/farm/getAllFarms');
    return res.data;
  },

  getAllActiveFarms: async () => {
    try {
      console.log('📡 Fetching all active farms...');
      const res = await apiClient.get('/api/farm/getAllFarms');
      console.log('✅ All active farms fetched:', res.data);
      // Return the data array from the response
      return res.data?.data || res.data || [];
    } catch (error) {
      console.error('❌ Error fetching all active farms:', error.message);
      throw error;
    }
  },

  /* ---------- CROP ---------- */
  addCrop: async payload => {
    console.log(
      '🌾 Adding crop with payload:',
      JSON.stringify(payload, null, 2),
    );
    const res = await apiClient.post('/api/crop/addCrop', payload);
    console.log('✅ Crop added successfully:', res.data);
    return res.data;
  },

  updateCropById: async (id, payload) => {
    console.log('🔄 Updating crop:', id, JSON.stringify(payload, null, 2));
    const res = await apiClient.put(`/api/crop/updateCrop/${id}`, payload);
    console.log('✅ Crop updated successfully:', res.data);
    return res.data;
  },

  deleteCropById: async id => {
    const res = await apiClient.delete(`/api/crop/deleteCrop/${id}`);
    return res.data;
  },

  getUserCropsByUserId: async () => {
    const res = await apiClient.get('/api/crop/getCropsByUser');
    return res.data;
  },

  getAllCrops: async () => {
    const res = await apiClient.get('/api/crop/getAllCrops');
    return res.data;
  },

  getOrderById: async id => {
    const res = await apiClient.get(`/api/order/getOrderById/${id}`);
    return res.data;
  },

  updateOrderPrices: async (id, payload) => {
    try {
      console.log('🔄 Updating order prices:', id, payload);
      const response = await apiClient.patch(
        `/api/order/${id}/update-prices`,
        payload,
      );
      console.log('✅ Order prices updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        '❌ updateOrderPrices error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  updateOrderStatus: async (id, payload) => {
    try {
      const traceId = `order-status-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      if (!id) {
        throw new Error('Order ID is required');
      }

      const status = typeof payload === 'string' ? payload : payload.status;

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        throw new Error('Invalid order status');
      }

      const requestBody =
        typeof payload === 'string'
          ? { status }
          : {
              ...payload,
              status,
            };

      console.log('🧭 [updateOrderStatus] trace:start', {
        traceId,
        orderId: id,
        incomingPayload: payload,
      });

      if (requestBody.sell === true) {
        const paymentMethod = requestBody.paymentMethod;

        if (!paymentMethod) {
          throw new Error('paymentMethod is required when selling order.');
        }
      }

      console.log('🧭 [updateOrderStatus] trace:requestBody', {
        traceId,
        orderId: id,
        requestBody,
      });

      const response = await apiClient.put(
        `/api/order/updateOrderStatus/${id}`,
        requestBody,
      );

      console.log('🧭 [updateOrderStatus] trace:response', {
        traceId,
        orderId: id,
        statusCode: response.status,
        data: response.data,
      });
      return response.data;
    } catch (error) {
      console.error('🧭 [updateOrderStatus] trace:error', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        payload: error.config?.data,
      });
      throw error;
    }
  },

  /* ---------- OTP ---------- */
  SendOtp: async payload => {
    const requestPayload = { ...payload };
    if (requestPayload.role) {
      const normalizedRole = normalizeOtpRole(requestPayload.role);
      requestPayload.role = normalizedRole;
    }
    const res = await apiClient.post('/api/otp/send-otp', requestPayload);
    return res.data;
  },

  /* ---------- Verify OTP ---------- */
  SendVerifyOtp: async payload => {
    const requestPayload = { ...payload };
    if (requestPayload.role) {
      requestPayload.role = normalizeOtpRole(requestPayload.role);
    }
    const res = await apiClient.post('/api/otp/verify-otp', requestPayload);
    return res.data;
  },

  saveFcmToken: async data => {
    const res = await apiClient.post('/api/fcm/save-token', data);
    console.log('✅ saveFcmToken response:', res.data);
    return res.data;
  },

  MyOrders: async () => {
    // ========== STEP 4: MY ORDERS API TRACE ==========
    console.log('========== MY ORDERS API TRACE ==========');

    const res = await apiClient.get('/api/order/myOrders');

    console.log('My Orders Response:', JSON.stringify(res.data, null, 2));
    if (res.data?.data && res.data.data.length > 0) {
      console.log(
        'First Order Sample:',
        JSON.stringify(res.data.data[0], null, 2),
      );
      console.log(
        'First Order Payment Method:',
        res.data.data[0]?.paymentMethod,
      );
    }
    console.log('=========================================');

    return res.data.data; // ✅ return only orders array
  },

  getExpiringProducts: async () => {
    const res = await apiClient.get('/api/product/expiringProducts');
    return res.data;
  },

  /* ---------- PRIVATE FILES ---------- */
  getPrivateFiles: async type => {
    try {
      console.log(`📂 Fetching private files of type: ${type}`);
      const res = await apiClient.get(`/api/user/files/private?type=${type}`);
      console.log('✅ Private files fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getPrivateFiles error:', error.message);
      throw error;
    }
  },

  /* ---------- CROP DOCTOR ---------- */
  saveReport: async payload => {
    const res = await apiClient.post('/api/crop-doctor/saveReport', payload);
    return res.data;
  },

  getUserReports: async userId => {
    try {
      const res = await apiClient.get(
        `/api/crop-doctor/getUserReports/${userId}`,
      );
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

  getReportById: async reportId => {
    const res = await apiClient.get(
      `/api/crop-doctor/getReportById/${reportId}`,
    );
    return res.data;
  },

  deleteReport: async reportId => {
    const res = await apiClient.delete(
      `/api/crop-doctor/deleteReport/${reportId}`,
    );
    return res.data;
  },

  /* ---------- CROP CALENDAR ---------- */
  getAllCropsCalendar: async () => {
    const res = await apiClient.get('/api/crop-calendar/');

    console.log('📅 All crops calendar response:', res.data);
    return res.data;
  },

  getCropCalendarByName: async (cropName, variety = null) => {
    try {
      let url = `/api/crop-calendar/${cropName}`;
      if (variety && variety.trim()) {
        url += `?variety=${encodeURIComponent(variety.trim())}`;
      }
      console.log('🌾 Fetching crop calendar:', url);
      const res = await apiClient.get(url);
      console.log(
        '🌾 CROP CALENDAR RESPONSE:',
        JSON.stringify(res.data, null, 2),
      );
      return res.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.error(
          '⚠️ Cannot connect to server. Check if backend is running.',
        );
      }
      throw error;
    }
  },

  getCropCalendarById: async cropId => {
    const res = await apiClient.get(`/api/crop/${cropId}/calendar`);
    return res.data;
  },

  /* ---------- CROP ANALYTICS ---------- */
  getCropAnalytics: async () => {
    try {
      console.log('📊 Fetching crop analytics...');
      const res = await apiClient.get('/api/crop/analytics');
      console.log('✅ Crop analytics fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getCropAnalytics error:', error.message);
      throw error;
    }
  },

  /* ---------- MANDI PRICES ---------- */
  getMandiPrices: async (state, district, commodity) => {
    try {
      const url = `/api/mandi/prices?state=${encodeURIComponent(
        state,
      )}&district=${encodeURIComponent(
        district,
      )}&commodity=${encodeURIComponent(commodity)}`;
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

  /* ---------- RETAILER INQUIRY ---------- */
  submitRetailerInquiry: async payload => {
    try {
      console.log('📝 Submitting retailer inquiry:', payload);
      const hasImageData =
        payload.inquiryPhoto &&
        typeof payload.inquiryPhoto === 'object' &&
        payload.inquiryPhoto.uri;

      if (hasImageData) {
        const formData = new FormData();

        Object.keys(payload).forEach(key => {
          if (key !== 'inquiryPhoto') {
            const value = payload[key];
            formData.append(key, value == null ? '' : String(value));
          }
        });

        formData.append('inquiryPhoto', payload.inquiryPhoto);

        console.log('📤 Sending multipart form data with inquiry photo');
        console.log('🖼️ Image details:', {
          uri: payload.inquiryPhoto.uri,
          type: payload.inquiryPhoto.type,
          name: payload.inquiryPhoto.name,
        });

        const res = await apiClient.post('/api/inquiry/add', formData, {
          timeout: 300000,
        });

        console.log('✅ Inquiry submitted successfully:', res.data);
        return res.data;
      }

      const res = await apiClient.post('/api/inquiry/add', payload);
      console.log('✅ Inquiry submitted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ submitRetailerInquiry error:', error.message);
      throw error;
    }
  },

  getRetailerInquiries: async () => {
    try {
      console.log('📋 Fetching retailer inquiries');
      const res = await apiClient.get('/api/retailer/inquiry');
      console.log('✅ Inquiries fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getRetailerInquiries error:', error.message);
      throw error;
    }
  },

  getRetailerInquiryById: async id => {
    try {
      console.log(`📋 Fetching inquiry by id: ${id}`);
      const res = await apiClient.get(`/api/retailer/inquiry/${id}`);
      console.log('✅ Inquiry fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getRetailerInquiryById error:', error.message);
      throw error;
    }
  },

  /* ---------- STAFF INQUIRY ---------- */
  submitStaffInquiry: async payload => {
    try {
      console.log('📝 Submitting staff inquiry:', payload);

      // Check if payload contains image file object
      const hasImageData =
        (payload.inquiryPhoto &&
          typeof payload.inquiryPhoto === 'object' &&
          payload.inquiryPhoto.uri) ||
        (payload.photo &&
          typeof payload.photo === 'object' &&
          payload.photo.uri);

      if (hasImageData) {
        // Create FormData for multipart upload
        const formData = new FormData();

        const photoFile = payload.inquiryPhoto || payload.photo;

        // Add all fields except photo to FormData
        Object.keys(payload).forEach(key => {
          if (key !== 'photo' && key !== 'inquiryPhoto') {
            const value = payload[key];
            formData.append(key, value == null ? '' : String(value));
          }
        });

        // Add the image file to FormData
        formData.append('inquiryPhoto', photoFile);

        console.log('📤 Sending multipart form data with image');
        console.log('🖼️ Image details:', {
          uri: photoFile.uri,
          type: photoFile.type,
          name: photoFile.name,
        });

        const res = await apiClient.post('/api/inquiry/add', formData, {
          timeout: 300000, // 5 minutes for image uploads
        });

        console.log('✅ Staff inquiry submitted successfully:', res.data);
        return res.data;
      } else {
        // Send as JSON if no image
        console.log('📤 Sending JSON data without image');
        const { inquiryPhoto, photo, ...jsonPayload } = payload;
        const res = await apiClient.post('/api/inquiry/add', jsonPayload);
        console.log('✅ Staff inquiry submitted successfully:', res.data);
        return res.data;
      }
    } catch (error) {
      console.error('❌ submitStaffInquiry error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getAllInquiries: async () => {
    try {
      console.log('📋 Fetching all inquiries');
      const res = await apiClient.get('/api/inquiry/all');
      const payload = res?.data || {};
      const safeList = Array.isArray(payload?.data) ? payload.data : [];

      const normalizedPayload = {
        ...payload,
        success: typeof payload?.success === 'boolean' ? payload.success : true,
        count:
          typeof payload?.count === 'number' ? payload.count : safeList.length,
        data: safeList,
      };

      console.log('✅ Inquiries fetched:', normalizedPayload.count);
      return normalizedPayload;
    } catch (error) {
      console.error('❌ getAllInquiries error:', error.message);
      throw error;
    }
  },

  getInquiryById: async id => {
    if (!id) {
      throw new Error('Inquiry ID is required');
    }

    try {
      console.log(`📋 Fetching inquiry details by id: ${id}`);
      const res = await apiClient.get(`/api/inquiry/${id}`);
      const payload = res?.data || {};

      const normalizedPayload = {
        ...payload,
        success: typeof payload?.success === 'boolean' ? payload.success : true,
        data:
          payload?.data && typeof payload.data === 'object'
            ? payload.data
            : null,
      };

      console.log('✅ Inquiry details fetched');
      return normalizedPayload;
    } catch (error) {
      console.error('❌ getInquiryById error:', error.message);
      throw error;
    }
  },

  /* ---------- RETAILER DOCUMENTS ---------- */
  getRetailerDocuments: async (type, userId) => {
    try {
      const token = await getAccessToken();

      let response = await fetch(
        `${API_BASE_URL}/api/admin/files/private?type=${type}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        response = await fetch(
          `${API_BASE_URL}/api/user/files/private?type=${type}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        );
      }

      if (response.ok) {
        const json = await response.json();
        const data = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.files)
          ? json.files
          : [];

        if (data.length > 0) {
          return data;
        } else {
          const profileData = await apiService.getProfileDetails();
          const pData = profileData?.[type];
          return pData ? (Array.isArray(pData) ? pData : [pData]) : [];
        }
      } else {
        const profileData = await apiService.getProfileDetails();
        const pData = profileData?.[type];
        return pData ? (Array.isArray(pData) ? pData : [pData]) : [];
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      return [];
    }
  },

  uploadRetailerDocument: async (type, base64Data, replaceIndex = -1) => {
    try {
      const token = await getAccessToken();

      if (replaceIndex !== -1) {
        const deleteResponse = await fetch(
          `${API_BASE_URL}/api/user/update-profile`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              [`${type}_delete`]: replaceIndex,
            }),
          },
        );

        const deleteJson = await deleteResponse.json();
        if (!deleteResponse.ok) {
          throw new Error(deleteJson?.message || 'Failed to delete old file');
        }
      }

      const payload = {
        [type]: base64Data,
        type: type,
      };

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || 'Upload failed');
      }

      return { success: true, data: json };
    } catch (err) {
      throw err;
    }
  },

  deleteRetailerDocument: async (type, index) => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [`${type}_delete`]: index,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message || 'Failed to delete');
      }

      return { success: true, data: json };
    } catch (err) {
      throw err;
    }
  },

  /* ---------- ATTENDANCE ---------- */
  checkIn: async payload => {
    try {
      console.log('⏰ Check-in request:', payload);
      const res = await apiClient.post('/api/attendance/check-in', payload);
      console.log('✅ Check-in successful:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ checkIn error:', error.message);
      throw error;
    }
  },

  checkOut: async payload => {
    try {
      console.log('⏰ Check-out request:', payload);
      const res = await apiClient.post('/api/attendance/check-out', payload);
      console.log('✅ Check-out successful:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ checkOut error:', error.message);
      throw error;
    }
  },

  applyLeave: async payload => {
    try {
      const userId = await getUserId();
      const requestPayload = { ...payload, userId };
      console.log('📝 Apply leave request:', requestPayload);
      const res = await apiClient.post(
        '/api/attendance/apply-leave',
        requestPayload,
      );
      console.log('✅ Leave applied successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ applyLeave error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getMyAttendance: async () => {
    try {
      console.log('📡 Fetching My Attendance');
      console.log('📡 Endpoint:', '/api/attendance/my-attendance');

      const token = await getAccessToken();
      console.log('📤 Headers:', {
        Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'none',
        'Content-Type': 'application/json',
      });

      const res = await apiClient.get('/api/attendance/my-attendance');

      console.log('✅ Attendance Response:', res.data);
      console.log('📊 Attendance Raw Data:', JSON.stringify(res.data, null, 2));
      console.log(
        '📊 Response Array Length:',
        Array.isArray(res.data?.data) ? res.data.data.length : 0,
      );

      return res.data;
    } catch (error) {
      console.error('❌ Attendance API Error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  /* ---------- TASKS ---------- */
  getMyTasks: async () => {
    try {
      console.log('📋 Fetching my tasks');
      const res = await apiClient.get('/api/tasks/my-tasks');
      console.log('✅ Tasks fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getMyTasks error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  createTask: async payload => {
    try {
      console.log('📝 Creating task:', payload);
      const res = await apiClient.post('/api/tasks/create', payload);
      console.log('✅ Task created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ createTask error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  assignTask: async payload => {
    try {
      console.log('📝 Assigning task:', payload);
      const res = await apiClient.post('/api/task/assign', payload);
      console.log('✅ Task assigned successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ assignTask error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  /* ---------- STAFF ---------- */
  getAllStaff: async () => {
    try {
      console.log('👥 Fetching all staff members');
      const res = await apiClient.get('/api/admin/staff');
      console.log('✅ Staff members fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getAllStaff error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getAssignedTasks: async () => {
    try {
      console.log('📋 Fetching assigned tasks');
      const res = await apiClient.get('/api/tasks/assigned');
      console.log('✅ Assigned tasks fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getAssignedTasks error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getTaskById: async taskId => {
    try {
      console.log('📋 Fetching task details for ID:', taskId);
      const res = await apiClient.get(`/api/tasks/${taskId}`);
      console.log('✅ Task details fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getTaskById error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  startTask: async taskId => {
    try {
      console.log('▶️ Starting task:', taskId);
      const res = await apiClient.put(`/api/tasks/${taskId}/start`);
      console.log('✅ Task started successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ startTask error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  completeTask: async taskId => {
    try {
      console.log('✅ Completing task:', taskId);
      const res = await apiClient.put(`/api/tasks/${taskId}/complete`, {});
      console.log('✅ Task completed successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ completeTask error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  /* ---------- FARMER DIARY ---------- */
  addIncome: async payload => {
    try {
      console.log('💰 Adding income entry:', payload);

      // Only send necessary fields: category, date, amount
      const cleanPayload = {
        userId: payload.userId,
        category: payload.category,
        date: payload.date,
        amount: payload.amount || payload.saleValue,
      };

      console.log('💰 Clean payload (only necessary fields):', cleanPayload);
      const res = await apiClient.post('/api/khata/income/add', cleanPayload);
      console.log('✅ Income entry added successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ addIncome error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getIncomesByUserId: async userId => {
    try {
      console.log('📊 Fetching incomes for user:', userId);
      const res = await apiClient.get(`/api/khata/income/${userId}`);
      console.log('✅ Incomes fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getIncomesByUserId error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  deleteIncomeByDate: async (userId, date) => {
    try {
      console.log('🗑️ Deleting income for user:', userId, 'date:', date);
      const res = await apiClient.delete(`/api/khata/income/${userId}`, {
        data: { date },
      });
      console.log('✅ Income deleted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ deleteIncomeByDate error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  deleteIncomeById: async incomeId => {
    try {
      console.log('🗑️ Deleting income by ID:', incomeId);
      const res = await apiClient.delete(`/api/khata/income/${incomeId}`);
      console.log('✅ Income deleted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ deleteIncomeById error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  updateIncomeById: async (incomeId, payload) => {
    try {
      console.log('✏️ Updating income by ID:', incomeId, payload);
      const res = await apiClient.put(`/api/khata/income/${incomeId}`, payload);
      console.log('✅ Income updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ updateIncomeById error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  addExpense: async payload => {
    try {
      console.log('💸 Adding expense entry:', payload);
      const res = await apiClient.post('/api/khata/expense/add', payload);
      console.log('✅ Expense entry added successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ addExpense error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getExpensesByUserId: async userId => {
    try {
      console.log('📊 Fetching expenses for user:', userId);
      const res = await apiClient.get(`/api/khata/expense/${userId}`);
      console.log('✅ Expenses fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getExpensesByUserId error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  deleteExpenseByDate: async (userId, date) => {
    try {
      console.log('🗑️ Deleting expense for user:', userId, 'date:', date);
      const res = await apiClient.delete(`/api/khata/expense/${userId}`, {
        data: { date },
      });
      console.log('✅ Expense deleted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ deleteExpenseByDate error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  deleteExpenseById: async expenseId => {
    try {
      console.log('🗑️ Deleting expense by ID:', expenseId);
      const res = await apiClient.delete(`/api/khata/expense/${expenseId}`);
      console.log('✅ Expense deleted successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ deleteExpenseById error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  updateExpenseById: async (expenseId, payload) => {
    try {
      console.log('✏️ Updating expense by ID:', expenseId, payload);
      const res = await apiClient.put(
        `/api/khata/expense/${expenseId}`,
        payload,
      );
      console.log('✅ Expense updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ updateExpenseById error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  getLedgerDetails: async (userId, startDate, endDate) => {
    try {
      console.log('📊 Fetching ledger details:', {
        userId,
        startDate,
        endDate,
      });
      const res = await apiClient.get(
        `/api/khata/ledger/${userId}?startDate=${startDate}&endDate=${endDate}`,
      );
      console.log('✅ Ledger details fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getLedgerDetails error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  /* ---------- FARMER ORDERS ---------- */
  getFarmerOrders: async farmerId => {
    try {
      console.log(`📦 Fetching orders for farmer: ${farmerId}`);
      const res = await apiClient.get(`/api/order/farmer/${farmerId}/orders`);
      console.log('✅ Farmer orders fetched:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ getFarmerOrders error:', error.message);
      throw error;
    }
  },

  downloadLedgerPdf: async (userId, startDate, endDate) => {
    try {
      console.log('📄 Downloading ledger PDF:', {
        userId,
        startDate,
        endDate,
      });
      const res = await apiClient.get(
        `/api/khata/ledger/pdf/${userId}?startDate=${startDate}&endDate=${endDate}`,
      );
      console.log('✅ Ledger PDF downloaded successfully');
      return res.data;
    } catch (error) {
      console.error('❌ downloadLedgerPdf error:', error.message);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },
};

export default apiService;
