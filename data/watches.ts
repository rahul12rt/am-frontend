export interface WatchImage {
  id: string;
  isoview: string;
  front: string;
  back: string;
  side: string;
  strap: string;
  closeup: string;
  dial: string;
}

export interface Watch {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  actualprice: string;
  offerprice: string;
  offerpercentage: string;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
  createdat: string;
  updatedat: string;
  WatchImages: WatchImage[];
}

export async function fetchWatches(): Promise<Watch[]> {
  const res = await fetch("http://localhost:5000/watches");
  if (!res.ok) throw new Error("Failed to fetch watches");
  return res.json();
}