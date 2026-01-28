// SimBrief Configuration for Web
// Disable SimBrief dispatch by setting enabled to false

export interface SimBriefConfig {
    enabled: boolean;
    apiKey: string;
    flightPlanFormat: string;
    costIndex: number;
    airline: string;
    extraFuelMinutes: number;
    customFpRemarks: string;
    allowCharter: boolean;
}

export const simbriefConfig: SimBriefConfig = {
    enabled: true,
    apiKey: "Ms7oZ2ro445xFDaSRJKUlORYDOxAtW4a", // Obtain at: https://www.simbrief.com/home/?page=support
    flightPlanFormat: "LIDO",
    costIndex: 20,
    airline: "LVT", // Airline ICAO/IATA code
    extraFuelMinutes: 20,
    customFpRemarks: "IVAOVA/LVT",
    allowCharter: true, // Set to false to disallow charter flights
};

export default simbriefConfig;
