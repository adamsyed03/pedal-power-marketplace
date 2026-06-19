const SUPABASE_URL = 'https://cirrgscedpitegcahklq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E8KefAY_I0CO_mKMDCpMcg_RT2dXiBB';

export const SUPABASE_ADMIN_EMAIL = 'pogonmobility@gmail.com';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  language: 'en' | 'sr';
  created_at: string;
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
  await request('/rest/v1/leads', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(lead),
  });
};

export const signInAdmin = async (password: string) => {
  const response = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email: SUPABASE_ADMIN_EMAIL, password }),
  });
  const session = await response.json();
  return session.access_token as string;
};

export const fetchLeads = async (accessToken: string) => {
  const response = await request(
    '/rest/v1/leads?select=id,name,phone,source,language,created_at&order=created_at.desc',
    { method: 'GET' },
    accessToken,
  );
  return response.json() as Promise<Lead[]>;
};
