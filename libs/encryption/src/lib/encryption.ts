export async function parseJWTAndImport(
  key: string,
  usages: KeyUsage[] = ['encrypt', 'decrypt'],
): Promise<CryptoKey> {
  const keyBuffer = new TextEncoder().encode(key);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages,
  );
}

export async function encryptContent(
  key: string,
  content: string,
): Promise<string> {
  const cryptoKey = await parseJWTAndImport(key);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedContent = new TextEncoder().encode(content);
  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    encodedContent,
  );

  const ivArray = Array.from(iv);
  const encryptedArray = Array.from(new Uint8Array(encryptedContent));
  const combinedArray = ivArray.concat(encryptedArray);

  return btoa(String.fromCharCode(...combinedArray));
}

export async function decryptContent(
  key: string,
  encryptedContent: string,
): Promise<string> {
  const cryptoKey = await parseJWTAndImport(key);

  const combinedArray = Uint8Array.from(atob(encryptedContent), (c) =>
    c.charCodeAt(0),
  );
  const iv = combinedArray.slice(0, 12);
  const data = combinedArray.slice(12);

  const decryptedContent = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    data,
  );

  return new TextDecoder().decode(decryptedContent);
}
