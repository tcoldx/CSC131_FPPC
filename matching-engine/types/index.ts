// Represents a single event, which contains multiple AgendaItemEntry objects
export interface Event {
    _id: string;
    eventId: number;
    bodyId: number;
    bodyName: string;           // "City Council - 5PM"
    citySlug: string;           // "sacramento" 
    eventDate: Date;
    eventLocation: string;
    ingestedAt: Date;
    lastUpdated: Date;
    items: AgendaItemEntry[];   // agenda items inside each event
    phase: string;
}

// Represents a single agenda item within an event
export interface AgendaItemEntry {
    eventItemId: number;
    matterId: number;
    matterTitle: string;       // primary field to match against
    matterType: string;        // "Consent Item"
    matterFile: string;
    matterStatus: string;
    matterText: string;        // secondary field to match against
    attachments: any[];
    actionTaken: string | null;
}

// Represents an public official from the Form 700, their assests are stored in an array
export interface Official {
    _id: string;
    lastName: string;
    firstName: string;
    middleName?: string;
    citySlug: string;
    position: string;
    email?: string;
    filingType: string;
    filingYear: string;
    businessName: string;
    businessDescription?: string;
    valueRange?: string;
    investmentType: string;
}

// Represents the output of the matching engine
export interface FlaggedResult {
    officialId: string;
    officialName: string;       // firstName + lastName combined
    agency: string;
    businessName: string;
    investmentType: string;
    citySlug: string;
    bodyName: string;
    eventDate: Date;
    matterTitle: string;
    matterText: string;
    score: number;              // 0-1 confidence
    createdAt: Date;           // when this was flagged
}