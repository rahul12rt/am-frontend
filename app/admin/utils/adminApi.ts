import type { Watch } from "../types/watch";

const API_BASE = "http://localhost:3001/api/watches";

export async function fetchWatches(): Promise<Watch[]> {
  const res = await fetch(API_BASE);
  return res.json();
}

export async function addWatch(data: Watch): Promise<Watch> {
  const res = await fetch(`${API_BASE}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateWatch(data: Watch): Promise<Watch> {
  const res = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteWatch(external_id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ external_id }),
  });
  return res.json();
}