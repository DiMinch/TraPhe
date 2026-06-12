import axiosClient from "@/lib/axios-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Product,
  ProductPageResponse,
  CreateProductRequest,
  UpdateProductRequest,
  GetProductsParams,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/types/product.types";

export const productService = {
  // Product listing (public — proxied via /api/products)
  getAllProducts: async (params?: GetProductsParams) => {
    const res = await axiosClient.get<any, ApiResponse<ProductPageResponse>>("/products", {
      params: {
        page: 0,
        size: 12,
        ...params,
      },
    });
    // The backend returns successPagination where data is the flat list of items,
    // and paging info is in the meta object. We adapt it to the expected ProductPageResponse.
    if (res && res.data) {
      const content = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
      const meta = (res as any).meta || {};
      
      const mappedContent = content.map((prod: any) => ({
        ...prod,
        variants: prod.sizes && prod.sizes.length > 0
          ? prod.sizes.map((s: any) => ({
              id: s.id,
              variantName: s.sizeName,
              sellingPrice: s.sellingPrice,
              sku: s.sku || `SIZE-${s.sizeName}`,
            }))
          : prod.basePrice != null
            ? [{
                id: prod.id,
                variantName: prod.name,
                sellingPrice: prod.basePrice,
                sku: `BASE-${prod.id}`,
              }]
            : [],
      }));

      res.data = {
        content: mappedContent,
        totalElements: typeof meta.totalElements === 'number' ? meta.totalElements : mappedContent.length,
        totalPages: typeof meta.totalPages === 'number' ? meta.totalPages : 1,
        currentPage: typeof meta.page === 'number' ? meta.page : 0,
        pageSize: typeof meta.size === 'number' ? meta.size : mappedContent.length,
        last: typeof meta.page === 'number' && typeof meta.totalPages === 'number' ? meta.page >= meta.totalPages - 1 : true,
        first: typeof meta.page === 'number' ? meta.page === 0 : true,
        numberOfElements: mappedContent.length,
      };
    }
    return res;
  },

  getProductById: async (id: string, branchId?: string | null) => {
    const res = await axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`, {
      params: branchId ? { branchId } : {},
    });
    if (res.data) {
      const d = res.data as any;
      res.data.variants = d.sizes && d.sizes.length > 0
        ? d.sizes.map((s: any) => ({
            id: s.id,
            variantName: s.sizeName,
            sellingPrice: s.sellingPrice,
            sku: s.sku || `SIZE-${s.sizeName}`,
          }))
        : d.basePrice != null
          ? [{
              id: d.id,
              variantName: d.name,
              sellingPrice: d.basePrice,
              sku: `BASE-${d.id}`,
            }]
          : [];
    }
    return res;
  },

  // Admin menu item management (via /api/admin/menu-items)
  createProduct: async (data: CreateProductRequest, image?: File) => {
    let imageUrl: string | null = null;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("folder", "menu-items");
      const uploadRes = await axiosClient.post<any, ApiResponse<{ imageUrl: string }>>("/menu/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (uploadRes.success && uploadRes.data) {
        imageUrl = uploadRes.data.imageUrl;
      }
    }

    const payload = {
      ...data,
      imageUrl,
    };
    return axiosClient.post<any, ApiResponse<Product>>("/admin/menu-items", payload);
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest,
    image?: File,
  ) => {
    let imageUrl: string | null = null;
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("folder", "menu-items");
      const uploadRes = await axiosClient.post<any, ApiResponse<{ imageUrl: string }>>("/menu/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (uploadRes.success && uploadRes.data) {
        imageUrl = uploadRes.data.imageUrl;
      }
    }

    const payload = {
      ...data,
      ...(imageUrl ? { imageUrl } : {}),
    };
    return axiosClient.put<any, ApiResponse<Product>>(`/admin/menu-items/${id}`, payload);
  },

  deleteProduct: async (id: string) => {
    return axiosClient.delete<any, ApiResponse<void>>(`/admin/menu-items/${id}`);
  },

  createVariant: async (data: CreateVariantRequest) => {
    console.warn("createVariant is mock-only (sizes are managed via menu-item updates in TraPhe)", data);
    return { success: true, message: "Mock variant created", data: null as any };
  },

  updateVariant: async (id: string, data: UpdateVariantRequest) => {
    console.warn("updateVariant is mock-only (sizes are managed via menu-item updates in TraPhe)", id, data);
    return { success: true, message: "Mock variant updated", data: null as any };
  },

  deleteVariant: async (id: string) => {
    console.warn("deleteVariant is mock-only (sizes are managed via menu-item updates in TraPhe)", id);
    return { success: true, message: "Mock variant deleted", data: null as any };
  },

  getToppings: async () => {
    return axiosClient.get<any, ApiResponse<any>>("/menu/toppings", {
      params: { size: 100 },
    });
  },
};
