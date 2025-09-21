
export function uploadFile(file: File) {
  const formData = new FormData();
  
  formData.append("file", file);

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/upload-and-process?user_id=123`, {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}

export function getPDF(s3Key: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/s3`, {
    method: "GET",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}

export async function streamPDF(s3Key: string, onProgress?: (progress: number) => void) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/s3/${s3Key}`, {
    method: "GET",
    headers: {
      'Accept': 'application/pdf',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDF stream failed: ${response.status} - ${errorText}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Call progress callback if provided
      if (onProgress && total > 0) {
        const progress = (receivedLength / total) * 100;
        onProgress(progress);
      }
    }
    
    // Combine all chunks into a single Uint8Array
    const allChunks = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    // Create blob and object URL
    const blob = new Blob([allChunks], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    return {
      blob,
      url,
      size: receivedLength
    };
    
  } finally {
    reader.releaseLock();
  }
}

export async function streamPDFToFile(s3Key: string, filename: string, onProgress?: (progress: number) => void) {
  const { blob } = await streamPDF(s3Key, onProgress);
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `document-${s3Key}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(link.href);
  
  return blob;
}
