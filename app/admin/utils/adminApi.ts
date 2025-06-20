const API_BASE = "http://localhost:3001/api/watches";

export async function fetchWatches() {
  const res = await fetch(API_BASE);
  return res.json();
}

export async function addWatch(data: any) {
  const res = await fetch(`${API_BASE}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateWatch(data: any) {
  const res = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteWatch(external_id: string) {
  const res = await fetch(`${API_BASE}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ external_id }),
  });
  return res.json();
}