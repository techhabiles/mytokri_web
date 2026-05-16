export const DEV_BASE_URL = "http://192.168.1.6:8080/api/";
export const PROD_BASE_URL = "https://api.mytokri.com/";

export const BASE_URL = import.meta.env.DEV ? DEV_BASE_URL : PROD_BASE_URL;

export const ROLE_ADMIN = 1;
export const ROLE_HUB_MANAGER = 3;

export const SESSION_KEY = "mytokri_session";
export const SUPPORT_PHONE = "9217473511";

export const ROLE_LABEL: Record<number, string> = {
  [ROLE_ADMIN]: "Admin",
  [ROLE_HUB_MANAGER]: "Hub Manager",
};
