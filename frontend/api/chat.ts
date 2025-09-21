
export function prompt(message: string) {

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v0/bedrock/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      console.log("Error response text:", errorText);
      throw new Error(`Prompt failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  });
}
