/**
 * Vietnam Administrative Data Utility (v2 — 2-tier: Tỉnh/Thành phố → Xã/Phường)
 * Từ 01/07/2025, Việt Nam bỏ cấp Huyện/Quận, chỉ còn 2 cấp.
 *
 * Sử dụng API: https://provinces.open-api.vn/api/v2/
 * Data được fetch 1 lần, cache trong memory để dùng cho SelectBox.
 */

import type { VnProvince, VnWard } from "@/types/address.types";

const API_BASE = "https://provinces.open-api.vn/api/v2";

let cachedProvinces: VnProvince[] | null = null;
let fetchPromise: Promise<VnProvince[]> | null = null;

/**
 * Lấy danh sách Tỉnh/Thành phố (34 đơn vị).
 * Kết quả được cache trong memory, chỉ gọi API 1 lần.
 */
export async function getProvinces(): Promise<VnProvince[]> {
  if (cachedProvinces) return cachedProvinces;

  // Tránh race condition: nếu đang fetch thì chờ kết quả
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(`${API_BASE}/p/`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch provinces");
      return res.json() as Promise<VnProvince[]>;
    })
    .then((data) => {
      cachedProvinces = data;
      fetchPromise = null;
      return data;
    })
    .catch((err) => {
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

/**
 * Lấy danh sách Xã/Phường của 1 Tỉnh/Thành phố (theo mã code).
 * Gọi API riêng vì danh sách /p/ không trả kèm wards.
 */
export async function getWardsByProvinceCode(
  provinceCode: number,
): Promise<VnWard[]> {
  const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
  if (!res.ok) throw new Error(`Failed to fetch wards for province ${provinceCode}`);
  const data = (await res.json()) as VnProvince;
  return data.wards || [];
}

/**
 * Helper: Format options cho Select component.
 */
export function provincesToSelectOptions(provinces: VnProvince[]) {
  return provinces.map((p) => ({
    value: String(p.code),
    label: p.name,
  }));
}

export function wardsToSelectOptions(wards: VnWard[]) {
  return wards.map((w) => ({
    value: String(w.code),
    label: w.name,
  }));
}
