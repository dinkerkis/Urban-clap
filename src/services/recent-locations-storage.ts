import { File, Paths } from 'expo-file-system';

export type RecentLocation = {
  placeId: string;
  subtitle: string;
  title: string;
};

const MAX_RECENT_LOCATIONS = 6;
const recentLocationsFile = new File(Paths.document, 'recent-locations.json');

export async function getRecentLocations(): Promise<RecentLocation[]> {
  try {
    if (!recentLocationsFile.exists) return [];
    const stored = JSON.parse(await recentLocationsFile.text());
    if (!Array.isArray(stored)) return [];

    return stored.filter(
      (item): item is RecentLocation =>
        Boolean(item) &&
        typeof item.placeId === 'string' &&
        typeof item.title === 'string' &&
        typeof item.subtitle === 'string',
    );
  } catch {
    return [];
  }
}

export function saveRecentLocation(location: RecentLocation, current: RecentLocation[]): RecentLocation[] {
  const updated = [
    location,
    ...current.filter((item) => item.placeId !== location.placeId),
  ].slice(0, MAX_RECENT_LOCATIONS);

  try {
    recentLocationsFile.write(JSON.stringify(updated));
  } catch {
    // Selecting a location should still work if local persistence is unavailable.
  }

  return updated;
}
