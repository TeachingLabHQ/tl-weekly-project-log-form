export async function fetchMondayData(queryBody: string): Promise<any> {
  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjIzNDI2ODE2OCwidWlkIjozMTI4ODQ0NCwiaWFkIjoiMjAyMy0wMi0wM1QwMDozNjoyMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODg4NDgxOSwicmduIjoidXNlMSJ9.oM37gRdrLf8UnnmuZIM-QWDRoT_GtgFLLyHpvnxGUtQ",
      "API-Version": "2023-10",
    },
    body: JSON.stringify({
      query: queryBody,
    }),
  });
  const result = await response.json();
  return result;
}
