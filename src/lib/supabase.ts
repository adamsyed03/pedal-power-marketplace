const SUPABASE_URL = 'https://cirrgscedpitegcahklq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E8KefAY_I0CO_mKMDCpMcg_RT2dXiBB';

export const SUPABASE_ADMIN_EMAIL = 'pogonmobility@gmail.com';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  language: 'en' | 'sr' | 'ru';
  created_at: string;
  city: string | null;
  country: string | null;
  date_contacted: string | null;
  comment: string | null;
};

export type AdminSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

const request = async (path: string, init: RequestInit = {}, accessToken = SUPABASE_KEY) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || body?.error_description || body?.hint || 'Supabase request failed.');
  }

  return response;
};

export const submitLead = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
  const { name, phone, source, language, city, comment } = lead;
  await request('/rest/v1/leads', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ name, phone, source, language, city, comment }),
  });
};

export const signInAdmin = async (password: string): Promise<AdminSession> => {
  const response = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email: SUPABASE_ADMIN_EMAIL, password }),
  });
  return response.json() as Promise<AdminSession>;
};

export const refreshAdminSession = async (refreshToken: string): Promise<AdminSession> => {
  const response = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return response.json() as Promise<AdminSession>;
};

export const fetchLeads = async (accessToken: string) => {
  const response = await request(
    '/rest/v1/leads?select=id,name,phone,source,language,created_at,city,country,date_contacted,comment&order=created_at.desc',
    { method: 'GET' },
    accessToken,
  );
  return response.json() as Promise<Lead[]>;
};

export const updateLead = async (
  accessToken: string,
  id: string,
  changes: Partial<Pick<Lead, 'city' | 'country' | 'date_contacted' | 'comment'>>,
) => {
  await request(
    `/rest/v1/leads?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(changes),
    },
    accessToken,
  );
};
