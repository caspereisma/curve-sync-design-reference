import referenceUiDataJson from './referenceUiData.json';

export interface RegistrationSegment {
    color: 'green' | 'yellow' | 'blue' | 'gray' | 'empty';
    value: number;
}

export type SyncState = 'not-synced' | 'synced' | 'requires-sync';

export interface RightsHolderClientDetails {
    nrpClientId: string;
    businessRegisteredAddress: string;
    businessMailingAddress: string;
    subLabels: string;
    fugaOrgId: string;
    ddexPartyId: string;
    otherIdentifiers: string;
    royaltiesClientName: string;
    royaltiesContractReferences: string;
    dealEndDate: string;
    accountingFrequency: string;
    currency: string;
    autoExtend: string;
    autoExtendEvery: string;
    noticePeriod: string;
    advance: string;
    advanceAmount: string;
    advanceRecoupment: string;
    syncDealTermsWithCurve: string;
    accountBalance: string;
    openingBalance: string;
    closingBalance: string;
    netAmount: string;
    netCosts: string;
    netOutput: string;
    bankAccountNumber: string;
    bankAccountPayee: string;
    bankCity: string;
    bankCountry: string;
    bankName: string;
    bankSwiftNumber: string;
    bankIbanNumber: string;
    billingEmail: string;
    comments: string;
}

export interface RepertoireAsset {
    id: string;
    artist: string;
    title: string;
    version: string;
    isrc: string;
    album: string;
    territories: string;
    startDate: string;
    endDate: string;
    syncState: SyncState;
}

export interface StatementSummary {
    id: string;
    period: string;
    currency: string;
    subtotal: string;
    recoupmentState: RecoupmentState;
    expanded: boolean;
    files: StatementFile[];
}

export type RecoupmentState = 'in-recoupment' | 'post-recoupment' | 'just-recouped';

export interface StatementFile {
    id: string;
    type: string;
    fileName: string;
}

export interface CmoRegistration {
    cmo: string;
    territories: string;
    startDate: string;
    endDate: string;
    status: string;
    statusDate: string;
}

export interface TerritoryDeal {
    id: string;
    territories: string;
    rateType: 'flat' | 'sliding';
    rate: string;
    slidingScale?: Array<{
        id: string;
        to: string;
        rate: string;
    }>;
    startDate: string;
    endDate: string;
    status: string;
    syncState: SyncState;
}

export interface RightsHolderSummary {
    id: string;
    clientName: string;
    tier: string;
    dealStartDate: string;
    registrations: RegistrationSegment[];
    syncState: SyncState;
}

export interface RightsHolderClient extends RightsHolderSummary {
    details: RightsHolderClientDetails;
    territoryDeals: TerritoryDeal[];
    repertoireAssets: RepertoireAsset[];
    statements: StatementSummary[];
    cmoRegistrations: CmoRegistration[];
}

export type CurveSalesTermPriceCategory = 'Performer' | 'Rightsholder';

export interface ReferenceCurveSalesTerm {
    id: string;
    sourceDealId: string;
    catType: string;
    catalogueGroup: string;
    territory: string;
    channel: string;
    configuration: string;
    priceCategory: CurveSalesTermPriceCategory;
    source: string;
    type: string;
    rate: string;
    multiplier: string;
    reductionRate: string;
    reserve: string;
}

interface ReferenceCurveSyncData {
    payee: {
        foreignId: string;
        name: string;
        alternateName: string;
        country: string;
        address: string;
        contactEmail: string;
        payeeCategories: string;
    };
    contract: {
        name: string;
        startDate: string;
        endDate: string;
        payeeId: string;
        payeePercentage: string;
        currency: string;
    };
    salesTerms: ReferenceCurveSalesTerm[];
}

interface ReferenceUiDataJson {
    curveSync: ReferenceCurveSyncData;
    rightsHolders: Array<
        Omit<RightsHolderSummary, 'syncState'> &
            Partial<Pick<RightsHolderSummary, 'syncState'>> &
            Partial<
                Pick<RightsHolderClient, 'details' | 'statements' | 'cmoRegistrations'> & {
                    territoryDeals: Array<Omit<TerritoryDeal, 'syncState'> & Partial<Pick<TerritoryDeal, 'syncState'>>>;
                    repertoireAssets: Array<Omit<RepertoireAsset, 'syncState'> & Partial<Pick<RepertoireAsset, 'syncState'>>>;
                }
            >
    >;
}

const emptyDetails: RightsHolderClientDetails = {
    nrpClientId: '',
    businessRegisteredAddress: '',
    businessMailingAddress: '',
    subLabels: '',
    fugaOrgId: '',
    ddexPartyId: '',
    otherIdentifiers: '',
    royaltiesClientName: '',
    royaltiesContractReferences: '',
    dealEndDate: '',
    accountingFrequency: '',
    currency: '',
    autoExtend: '',
    autoExtendEvery: '',
    noticePeriod: '',
    advance: '',
    advanceAmount: '',
    advanceRecoupment: '',
    syncDealTermsWithCurve: '',
    accountBalance: '',
    openingBalance: '',
    closingBalance: '',
    netAmount: '',
    netCosts: '',
    netOutput: '',
    bankAccountNumber: '',
    bankAccountPayee: '',
    bankCity: '',
    bankCountry: '',
    bankName: '',
    bankSwiftNumber: '',
    bankIbanNumber: '',
    billingEmail: '',
    comments: ''
};

const referenceUiData = referenceUiDataJson as ReferenceUiDataJson;

export const referenceCurveSyncData = referenceUiData.curveSync;

export const referenceRightsHolders: RightsHolderClient[] = referenceUiData.rightsHolders.map((client) => ({
    ...client,
    syncState: client.syncState ?? 'not-synced',
    details: {
        ...emptyDetails,
        nrpClientId: client.id,
        royaltiesClientName: client.clientName,
        ...(client.details ?? {})
    },
    territoryDeals: (client.territoryDeals ?? []).map((deal) => ({
        ...deal,
        rateType: deal.rateType ?? 'flat',
        syncState: deal.syncState ?? client.syncState ?? 'not-synced'
    })),
    repertoireAssets: (client.repertoireAssets ?? []).map((asset) => ({
        ...asset,
        syncState: asset.syncState ?? 'not-synced'
    })),
    statements: client.statements ?? [],
    cmoRegistrations: client.cmoRegistrations ?? []
}));

export const getReferenceRightsHolderById = (id: string | undefined): RightsHolderClient =>
    referenceRightsHolders.find((client) => client.id === id) ?? referenceRightsHolders[0];
