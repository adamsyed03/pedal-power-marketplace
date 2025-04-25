import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, type } = req.body;
    
    if (!email || !type) {
      return res.status(400).json({ error: 'Email and type are required' });
    }

    // The KV namespace ID for executive emails
    const namespaceId = '5eee87c3393f4592abdafb0aa5cb46c4';
    const timestamp = new Date().toISOString();
    const key = `${type}_${timestamp}_${email}`;
    
    // Cloudflare KV API endpoint
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/values/${key}`;
    
    const cfResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: email,
    });
    
    const cfData = await cfResponse.json();
    
    if (!cfResponse.ok) {
      console.error('Cloudflare KV error:', cfData);
      return res.status(500).json({ error: 'Failed to store email in Cloudflare KV' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 