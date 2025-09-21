
export function getJournalEntries() {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/journal-entry`, {
    method: "GET",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}

export function saveJournalEntry(journalEntry: {
  date: string;
  reference: string;
  description: string;
  lines: Array<{
    account_code: number;
    debit: number;
    credit: number;
    description: string;
  }>;
}) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/db/journal-entry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(journalEntry),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Save failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}
