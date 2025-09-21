
export function getJournalEntries() {
  const formData = new FormData();
  
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/s3-store-file?user_id=123`, {
    method: "GET",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}


export function createJournalEntry(file: File) {
  const formData = new FormData();
  
  formData.append("file", file);

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/s3-store-file?user_id=123`, {
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
