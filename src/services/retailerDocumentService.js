import { getAccessToken, getUserData } from "../Redux/Storage";
import { API_BASE_URL } from "../config";
import apiService from "../Redux/apiService";

export const retailerDocumentService = {
  async getDocuments(type, userId) {
    try {
      const token = await getAccessToken();
      
      let response = await fetch(
        `${API_BASE_URL}/api/admin/files/private?type=${type}&userId=${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        response = await fetch(
          `${API_BASE_URL}/api/user/files/private?type=${type}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      }

      if (response.ok) {
        const json = await response.json();
        const data = Array.isArray(json) ? json : 
                    Array.isArray(json?.data) ? json.data : 
                    Array.isArray(json?.files) ? json.files : [];
        
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

  async uploadDocument(type, base64Data, replaceIndex = -1) {
    try {
      const token = await getAccessToken();

      if (replaceIndex !== -1) {
        const deleteResponse = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [`${type}_delete`]: replaceIndex,
          }),
        });

        const deleteJson = await deleteResponse.json();
        if (!deleteResponse.ok) {
          throw new Error(deleteJson?.message || "Failed to delete old file");
        }
      }

      const payload = {
        [type]: base64Data,
        type: type,
      };

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || "Upload failed");
      }

      return { success: true, data: json };
    } catch (err) {
      throw err;
    }
  },

  async deleteDocument(type, index) {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [`${type}_delete`]: index,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message || "Failed to delete");
      }

      return { success: true, data: json };
    } catch (err) {
      throw err;
    }
  },
};
