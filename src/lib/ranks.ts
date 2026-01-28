import Pilot, { IPilot } from '@/models/Pilot';

export const RANKS = [
    { name: 'Cadet', hours: 0, flights: 0 },
    { name: 'Second Officer', hours: 50, flights: 10 },
    { name: 'First Officer', hours: 150, flights: 30 },
    { name: 'Senior First Officer', hours: 300, flights: 60 },
    { name: 'Captain', hours: 500, flights: 100 },
];

/**
 * Checks if a pilot is eligible for a rank upgrade and performs it.
 * @param pilotId The database ID of the pilot (String or ObjectId)
 * @returns The new rank name if upgraded, or null if no change.
 */
export async function checkAndUpgradeRank(pilotId: string): Promise<string | null> {
    try {
        const pilot = await Pilot.findById(pilotId);
        if (!pilot) return null;

        const currentRankName = pilot.rank;
        const currentHours = pilot.total_hours;
        const currentFlights = pilot.total_flights;

        // Find the highest rank the pilot is eligible for
        let eligibleRank = RANKS[0]; // Default to Cadet

        for (const rank of RANKS) {
            if (currentHours >= rank.hours && currentFlights >= rank.flights) {
                eligibleRank = rank;
            }
        }

        // Helper to get index for comparison
        const getRankIndex = (name: string) => RANKS.findIndex(r => r.name === name);

        const currentIndex = getRankIndex(currentRankName);
        const newIndex = getRankIndex(eligibleRank.name);

        // Only upgrade if the new rank is higher than current
        if (newIndex > currentIndex) {
            console.log(`Upgrading Pilot ${pilot.pilot_id} from ${currentRankName} to ${eligibleRank.name}`);
            
            pilot.rank = eligibleRank.name;
            await pilot.save();
            
            return eligibleRank.name;
        }

        return null;
    } catch (error) {
        console.error('Error checking rank upgrade:', error);
        return null;
    }
}
