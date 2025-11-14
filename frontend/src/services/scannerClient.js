const BASE_URL = import.meta.env.VITE_SCANNER_URL || 'http://localhost:5080';

export async function scanProduct(barcode) {
  const response = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ barcode }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || error?.message || 'Scan failed');
  }

  return response.json();
}

export async function readCachedScan(barcode) {
  const response = await fetch(`${BASE_URL}/scan/${barcode}`);
  if (!response.ok) {
    throw new Error('Scan not found');
  }
  return response.json();
}
