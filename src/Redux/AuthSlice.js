import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken, setUserData } from "./Storage";
import { API_BASE_URL } from '../config';

export const pythonUrl = API_BASE_URL;

console.log('🌐 API Base URL:', pythonUrl);

// Axios instance with retry logic for sleeping server
const api = axios.create({
  baseURL: pythonUrl,
  timeout: 30000, // 30 seconds timeout
});

api.interceptors.request.use(
  (config) => {
    console.log('📡 Request Config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  async (error) => {
    console.log('❌ Response Error:', {
      message: error.message,
      code: error.code,
      status: error?.response?.status,
    });
    
    const config = error.config;
    if (!config._retry && (error.code === 'ECONNABORTED' || error.message === 'Network Error')) {
      config._retry = true;
      console.log('🔄 Retrying request...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return api(config);
    }
    return Promise.reject(error);
  }
);

const initialState ={
    userData:null,
      registeredUser: null, 
    isLoading :false,
    isSuccess:false,
    isError:false,
}



export const login = createAsyncThunk(
  "login",
  async ({ phone, role, password }, { rejectWithValue }) => {
    try {
      console.log("🔐 LOGIN ATTEMPT:");
      console.log("📱 Phone:", phone);
      console.log("👤 Role:", role);
      console.log("🔑 Password:", password ? "***" : "MISSING");
      console.log("🌐 API URL:", `${pythonUrl}/api/user/signin`);

      if (!phone || !role || !password) {
        console.log("❌ Validation failed: Missing required fields");
        return rejectWithValue("Phone, role and password are required");
      }

      console.log("📤 Sending request...");
      
      const requestData = {
        phone,
        role,
        password,
      };
      console.log("📦 Request Data:", requestData);
      
      const response = await api.post(
        '/api/user/signin',
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      console.log("✅ API Response:", response.data);
      console.log("👤 User from API:", response?.data?.user);
      console.log("🎫 Token:", response?.data?.token ? "Received" : "Missing");

      const userFromApi = response?.data?.user || {};

      // ✅ FORCE & NORMALIZE ROLE
      const normalizedRole =
        userFromApi?.role?.toLowerCase?.() || role.toLowerCase();

      console.log("🔄 Normalized Role:", normalizedRole);

      // ✅ SAVE CORRECT ROLE
      await setUserData({
        ...userFromApi,
        role: normalizedRole,
      });

      await setAccessToken(response?.data?.token);

      console.log("💾 User data saved to storage");

      return {
        ...response.data,
        user: { ...userFromApi, role: normalizedRole },
      };
    } catch (error) {
      console.log("❌ LOGIN ERROR:");
      console.log("Full Error:", error);
      console.log("Error Response:", error?.response?.data);
      console.log("Error Status:", error?.response?.status);
      console.log("Error Message:", error?.message);
      console.log("Error Code:", error?.code);
      
      // Extract error message from response
      let errorMessage = "Login failed";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      console.log("📢 Error Message to User:", errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
);


  export const logOut = createAsyncThunk('logout', async () => {
    try {
      await AsyncStorage.clear();
        return null; 
    } catch (error) {
        console.error("Error occurred during logout:", error);
        throw error;
    }
  });

  export const googleLoginrout = createAsyncThunk('googleLogin', async (googleData) => {
  try {
   
    // save into AsyncStorage
    // await setUserData(googleData);
    // await setAccessToken(googleData?.token); // optional, if you have token
    console.log("ABCDEFG", googleData);
    

    return googleData; // just return what you received
  } catch (error) {
    console.error("Error occurred during Google login:", error.message);
    throw error;
  }
});


  const AuthSlice = createSlice({
    name:"authSlice",
    initialState,
reducers: {
    // ✅ STORE REGISTER DATA (MOBILE NUMBER)
    saveRegisteredUser: (state, action) => {
      state.registeredUser = action.payload;
    },

    clearRegisteredUser: (state) => {
      state.registeredUser = null;
    },
  },
    extraReducers: builder => {
   
        // getProfile 

        builder.addCase(login.pending, (state) => {
          state.isLoading = true;
        });

        builder.addCase(login.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.userData = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
        });



        builder.addCase(logOut.fulfilled, (state, action) => {
          state.userData = null;
          state.isLoading = false;
          state.isSuccess = false;
          state.isError = false;
      });

       builder.addCase(googleLoginrout.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.userData = action.payload;
        });
      },  
})

export const {
  saveRegisteredUser,
  clearRegisteredUser,
} = AuthSlice.actions;


export default AuthSlice.reducer