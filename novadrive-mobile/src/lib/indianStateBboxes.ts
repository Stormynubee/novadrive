export type IndianStateBbox = {
  name: string;
  south: number;
  west: number;
  north: number;
  east: number;
};

/** Coarse offline rectangles for Indian states/UTs — not survey-grade borders. */
export const INDIAN_STATE_BBOXES: IndianStateBbox[] = [
  { name: 'Andhra Pradesh', south: 12.6, west: 76.7, north: 19.1, east: 84.8 },
  { name: 'Arunachal Pradesh', south: 26.6, west: 91.5, north: 29.5, east: 97.4 },
  { name: 'Assam', south: 24.1, west: 89.7, north: 28.0, east: 96.0 },
  { name: 'Bihar', south: 24.2, west: 83.3, north: 27.5, east: 88.3 },
  { name: 'Chhattisgarh', south: 17.8, west: 80.2, north: 24.1, east: 84.4 },
  { name: 'Goa', south: 14.9, west: 73.7, north: 15.8, east: 74.3 },
  { name: 'Gujarat', south: 20.1, west: 68.2, north: 24.7, east: 74.5 },
  { name: 'Haryana', south: 27.6, west: 74.4, north: 30.9, east: 77.6 },
  { name: 'Himachal Pradesh', south: 30.4, west: 75.6, north: 33.2, east: 79.0 },
  { name: 'Jharkhand', south: 21.9, west: 83.3, north: 25.3, east: 87.9 },
  { name: 'Karnataka', south: 11.6, west: 74.0, north: 18.5, east: 78.6 },
  { name: 'Kerala', south: 8.2, west: 74.9, north: 12.8, east: 77.4 },
  { name: 'Madhya Pradesh', south: 21.0, west: 74.0, north: 26.9, east: 82.8 },
  { name: 'Maharashtra', south: 15.6, west: 72.6, north: 22.0, east: 80.9 },
  { name: 'Manipur', south: 23.8, west: 93.0, north: 25.7, east: 94.8 },
  { name: 'Meghalaya', south: 25.0, west: 89.8, north: 26.1, east: 92.8 },
  { name: 'Mizoram', south: 21.9, west: 92.2, north: 24.5, east: 93.4 },
  { name: 'Nagaland', south: 25.2, west: 93.3, north: 27.0, east: 95.2 },
  { name: 'Odisha', south: 17.8, west: 81.4, north: 22.5, east: 87.5 },
  { name: 'Punjab', south: 29.5, west: 73.9, north: 32.5, east: 76.9 },
  { name: 'Rajasthan', south: 23.0, west: 69.5, north: 30.1, east: 78.2 },
  { name: 'Sikkim', south: 27.0, west: 88.0, north: 28.3, east: 88.9 },
  { name: 'Tamil Nadu', south: 8.0, west: 76.0, north: 13.5, east: 80.5 },
  { name: 'Telangana', south: 15.8, west: 77.2, north: 19.9, east: 81.8 },
  { name: 'Tripura', south: 22.9, west: 91.0, north: 24.5, east: 92.3 },
  { name: 'Uttar Pradesh', south: 23.7, west: 77.0, north: 30.4, east: 84.6 },
  { name: 'Uttarakhand', south: 28.7, west: 77.5, north: 31.0, east: 81.0 },
  { name: 'West Bengal', south: 21.5, west: 85.8, north: 27.2, east: 89.9 },
];

function bboxArea(b: IndianStateBbox): number {
  return (b.north - b.south) * (b.east - b.west);
}

function pointInBbox(lat: number, lng: number, b: IndianStateBbox): boolean {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

export function inferIndianStateName(lat: number, lng: number): string {
  let best: IndianStateBbox | null = null;
  let bestArea = Infinity;
  for (const box of INDIAN_STATE_BBOXES) {
    if (!pointInBbox(lat, lng, box)) continue;
    const area = bboxArea(box);
    if (area < bestArea) {
      best = box;
      bestArea = area;
    }
  }
  return best?.name ?? 'India';
}
