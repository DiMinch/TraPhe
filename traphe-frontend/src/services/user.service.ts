import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserInfo,
  UserAddress,
  Province,
  Commune,
} from "@/types/user.types";

/**
 * Decode HTML entities (e.g. &amp;atilde; → ã) that may have been
 * stored in the DB by earlier code paths or external API quirks.
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  let decoded = str;
  let previous = "";
  const textarea = document.createElement("textarea");
  while (decoded !== previous && decoded.includes("&")) {
    previous = decoded;
    textarea.innerHTML = decoded;
    decoded = textarea.value;
  }
  return decoded;
}

export const userService = {
  getProfile: async () => {
    const res = await axiosClient.get<any, ApiResponse<any>>("/auth/me");
    // Normalize backend field names to frontend UserInfo shape
    if (res.data) {
      const d = res.data;
      res.data = {
        ...d,
        avatar: d.avatarUrl ?? d.avatar,
        phone: d.phoneNumber ?? d.phone,
      };
    }
    return res as ApiResponse<UserInfo>;
  },

  updateProfile: async (formData: FormData) => {
    const res = await axiosClient.put<any, ApiResponse<any>>(
      "/auth/me",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    // Normalize response
    if (res.data) {
      const d = res.data;
      res.data = {
        ...d,
        avatar: d.avatarUrl ?? d.avatar,
        phone: d.phoneNumber ?? d.phone,
      };
    }
    return res as ApiResponse<UserInfo>;
  },

  getAddresses: async () => {
    const res = await axiosClient.get<any, ApiResponse<any[]>>("/users/addresses");
    if (res.data) {
      res.data = res.data.map((addr: any) => {
        let type = "Home";
        let street = addr.addressLine || "";
        if (street.startsWith("[")) {
          const typeEnd = street.indexOf("]");
          if (typeEnd !== -1) {
            type = street.substring(1, typeEnd);
            street = street.substring(typeEnd + 2);
          }
        }
        return {
          id: addr.id,
          street: street,
          detailAddress: street,
          communeCode: String(addr.wardCode),
          communeName: decodeHtmlEntities(addr.wardName),
          provinceCode: String(addr.provinceCode),
          provinceName: decodeHtmlEntities(addr.provinceName),
          type: type,
          isPrimary: addr.isDefault || false,
          contactName: addr.recipientName,
          contactPhone: addr.recipientPhone,
        };
      });
    }
    return res as any as ApiResponse<UserAddress[]>;
  },

  addAddress: async (data: any) => {
    const formattedStreet = `[${data.type || "Home"}] ${data.street}`;
    const payload = {
      recipientName: data.contactName,
      recipientPhone: data.contactPhone,
      addressLine: formattedStreet,
      wardCode: data.communeCode,
      wardName: data.communeName || "",
      provinceCode: data.provinceCode,
      provinceName: data.provinceName || "",
      isDefault: data.isPrimary,
    };
    const res = await axiosClient.post<any, ApiResponse<any>>(
      "/users/addresses",
      payload,
    );
    if (res.data) {
      const addr = res.data;
      let type = "Home";
      let street = addr.addressLine || "";
      if (street.startsWith("[")) {
        const typeEnd = street.indexOf("]");
        if (typeEnd !== -1) {
          type = street.substring(1, typeEnd);
          street = street.substring(typeEnd + 2);
        }
      }
      res.data = {
        id: addr.id,
        street: street,
        detailAddress: street,
        communeCode: addr.wardCode,
        communeName: addr.wardName,
        provinceCode: addr.provinceCode,
        provinceName: addr.provinceName,
        type: type,
        isPrimary: addr.isDefault || false,
        contactName: addr.recipientName,
        contactPhone: addr.recipientPhone,
      };
    }
    return res as any as ApiResponse<UserAddress>;
  },

  updateAddress: async (
    addressId: string,
    data: any,
  ) => {
    const formattedStreet = `[${data.type || "Home"}] ${data.street}`;
    const payload = {
      recipientName: data.contactName,
      recipientPhone: data.contactPhone,
      addressLine: formattedStreet,
      wardCode: data.communeCode,
      wardName: data.communeName || "",
      provinceCode: data.provinceCode,
      provinceName: data.provinceName || "",
      isDefault: data.isPrimary,
    };
    const res = await axiosClient.put<any, ApiResponse<any>>(
      `/users/addresses/${addressId}`,
      payload,
    );
    if (res.data) {
      const addr = res.data;
      let type = "Home";
      let street = addr.addressLine || "";
      if (street.startsWith("[")) {
        const typeEnd = street.indexOf("]");
        if (typeEnd !== -1) {
          type = street.substring(1, typeEnd);
          street = street.substring(typeEnd + 2);
        }
      }
      res.data = {
        id: addr.id,
        street: street,
        detailAddress: street,
        communeCode: addr.wardCode,
        communeName: addr.wardName,
        provinceCode: addr.provinceCode,
        provinceName: addr.provinceName,
        type: type,
        isPrimary: addr.isDefault || false,
        contactName: addr.recipientName,
        contactPhone: addr.recipientPhone,
      };
    }
    return res as any as ApiResponse<UserAddress>;
  },

  deleteAddress: async (addressId: string) => {
    return axiosClient.delete<any, ApiResponse<null>>(
      `/users/addresses/${addressId}`,
    );
  },

  getProvinces: async () => {
    return axiosClient.get<any, ApiResponse<Province[]>>("/address/provinces");
  },

  getCommunes: async (provinceCode: string) => {
    return axiosClient.get<any, ApiResponse<Commune[]>>("/address/communes", {
      params: { provinceCode },
    });
  },
};
