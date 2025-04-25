import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // The KV namespace ID for executive emails
    const namespaceId = '5eee87c3393f4592abdafb0aa5cb46c4'; // Executive Affiliate namespace
    const timestamp = new Date().toISOString();
    const key = `${type || 'general'}_${timestamp}_${email}`;
    
    // Cloudflare API endpoint
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;
    
    const cfResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'text/plain',
      },
      body: email,
    });
    
    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('Cloudflare KV error:', errorText);
      return res.status(500).json({ error: 'Failed to store email' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 