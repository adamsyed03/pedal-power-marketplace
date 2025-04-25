/**
 * Stores an email in Cloudflare KV
 * @param email The email to store
 * @param type The type of email (executive or sales)
 * @returns Promise that resolves to the response from Cloudflare
 */
export async function storeEmail(email: string, type: 'executive' | 'sales'): Promise<Response> {
  const timestamp = new Date().toISOString();
  const key = `${type}_${timestamp}_${email}`;
  
  // The KV namespace ID for executive emails
  const namespaceId = '5eee87c3393f4592abdafb0aa5cb46c4';
  
  // Cloudflare KV API endpoint
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${namespaceId}/values/${key}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: email,
    });
    
    return response;
  } catch (error) {
    console.error('Error storing email in Cloudflare KV:', error);
    throw error;
  }
} 