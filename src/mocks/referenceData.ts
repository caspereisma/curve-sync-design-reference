const PERMISSIONS_REPERTOIRE = 'CLIENT_REPERTOIRE_ACCESS';
const PERMISSIONS_STATEMENTS = 'CLIENT_STATEMENTS_ACCESS';

export const referenceClientId = 'reference-rh-001';
export const referenceClientName = 'Meridian Sound Holdings Ltd.';

export const referenceClientResponse = {
    requestUUID: 'reference-client-request',
    data: {
        clientId: referenceClientId,
        id: 1001,
        rhId: 1001,
        nrpClientId: referenceClientId,
        legalCompanyName: referenceClientName,
        tier: 2,
        subLabels: 'North Signal, Echo Harbor, Paper Lantern',
        businessRegisteredAddress: '12 Mercer Street\nLondon W1F 0LB\nUnited Kingdom',
        businessMailingAddress: '12 Mercer Street\nLondon W1F 0LB\nUnited Kingdom',
        fugaOrgId: 'FUGA-MERIDIAN-001',
        ddexPartyId: 'PADPIDA20260001',
        otherIdentifiers: 'PPL label code 4421',
        royaltiesClientName: 'Meridian Sound Holdings',
        clientAliases: ['Meridian Sound', 'Meridian Holdings'],
        clientAlternativeNames: ['Meridian Sound', 'Meridian Signal Group'],
        permissions: [PERMISSIONS_REPERTOIRE, PERMISSIONS_STATEMENTS],
        bankAccountNumber: 'DE55 5001 0517 5407 3249 31',
        bankAccountPayee: 'Meridian Sound Holdings Ltd.',
        bankCity: 'Frankfurt',
        bankCountry: 'Germany',
        bankName: 'Taunus Private Bank',
        bankSwiftNumber: 'TAUNDEFF',
        bankIbanNumber: 'DE55500105175407324931',
        comments:
            'Reference client used for design reviews. Mirrors a label client with active international CMO footprint.',
        contactName: 'Ari Foster',
        contactEmail: 'ari.foster@meridiansound.example',
        contactPhone: '+44 20 7946 1204',
        startDate: '2023-01-01',
        endDate: '2027-12-31',
        accountingFrequency: 'QUARTERLY',
        currency: 'GBP',
        autoExtend: true,
        autoExtendPeriod: 1,
        autoExtendPeriodType: 'YEAR',
        noticePeriod: 90,
        advance: true,
        advanceAmount: 25000,
        syncDealTermsWithCurve: true,
        selectedTab: '',
        isDeletable: false,
        clientDeals: [
            {
                clientDealId: 701,
                clientId: 1001,
                rightsHolderId: 1001,
                dealType: 'STANDARD',
                claimMethod: 'DIRECT',
                dealRateType: 'FLAT',
                clientTerritoryDealRates: [{ rate: 50, threshold: null }],
                territoryPeriod: {
                    startDate: '2023-01-01',
                    endDate: '2025-12-31',
                    territoryDTO: {
                        territoryCodes: ['GB', 'IE', 'FR', 'DE'],
                        formattedTerritory: 'United Kingdom, Ireland, France, Germany'
                    }
                },
                locked: false
            },
            {
                clientDealId: 702,
                clientId: 1001,
                rightsHolderId: 1001,
                dealType: 'STANDARD',
                claimMethod: 'VIA_CMO',
                dealRateType: 'SLIDING',
                clientTerritoryDealRates: [
                    { rate: 40, threshold: null },
                    { rate: 55, threshold: 100000 }
                ],
                territoryPeriod: {
                    startDate: '2024-01-01',
                    endDate: '2026-12-31',
                    territoryDTO: {
                        territoryCodes: ['SE', 'NO', 'FI', 'DK'],
                        formattedTerritory: 'Sweden, Norway, Finland, Denmark'
                    }
                },
                locked: true
            }
        ]
    }
};

export const referenceRepertoireResponse = {
    requestUUID: 'reference-repertoire-request',
    data: {
        content: [
            {
                assetId: 'asset-101',
                artistList: 'Nova Vale',
                trackTitle: 'Afterimage',
                versionTitle: 'Original Mix',
                curveId: 'curve-1452',
                isrcCode: 'GBKPL2400011',
                assetPYear: '2024',
                albumTitle: 'Glass Rooms',
                ownershipTerritories: 'Worldwide excl. US',
                ownershipStartDate: '2024-01-12',
                ownershipEndDate: '2027-12-31',
                lastModified: '2026-03-21',
                createdDate: '2024-01-15'
            },
            {
                assetId: 'asset-102',
                artistList: 'Nova Vale',
                trackTitle: 'Blue Static',
                versionTitle: 'Radio Edit',
                curveId: '',
                isrcCode: 'GBKPL2400012',
                assetPYear: '2024',
                albumTitle: 'Glass Rooms',
                ownershipTerritories: 'United Kingdom, Ireland',
                ownershipStartDate: '2024-01-12',
                ownershipEndDate: '2026-12-31',
                lastModified: '2026-02-08',
                createdDate: '2024-01-15'
            },
            {
                assetId: 'asset-103',
                artistList: 'Kepler North feat. Sola',
                trackTitle: 'False Dawn',
                versionTitle: 'Instrumental',
                curveId: 'curve-1821',
                isrcCode: 'GBKPL2400117',
                assetPYear: '2025',
                albumTitle: 'The Long Circuit',
                ownershipTerritories: 'Europe',
                ownershipStartDate: '2025-03-03',
                ownershipEndDate: '2028-03-02',
                lastModified: '2026-04-02',
                createdDate: '2025-03-04'
            }
        ],
        totalElements: 3,
        totalPages: 1,
        currentPage: 0,
        pageSize: 10
    }
};

export const referenceStatementsResponse = {
    requestUUID: 'reference-statements-request',
    data: {
        statements: [
            {
                yearQuarterKey: '2025 Q4',
                invoiceSummary: 'GBP 42,810.25',
                invoiceStatus: 'post-recoupment',
                files: [
                    {
                        yearQuarterKey: '2025 Q4',
                        invoiceSummary: 'GBP 42,810.25',
                        invoiceStatus: 'post-recoupment',
                        type: 'Statement PDF',
                        filename: '2025-Q4-meridian-statement.pdf'
                    },
                    {
                        yearQuarterKey: '2025 Q4',
                        invoiceSummary: 'GBP 42,810.25',
                        invoiceStatus: 'post-recoupment',
                        type: 'CSV Detail',
                        filename: '2025-Q4-meridian-detail.csv'
                    }
                ]
            },
            {
                yearQuarterKey: '2025 Q3',
                invoiceSummary: 'GBP 18,420.10',
                invoiceStatus: 'pre-recoupment',
                files: [
                    {
                        yearQuarterKey: '2025 Q3',
                        invoiceSummary: 'GBP 18,420.10',
                        invoiceStatus: 'pre-recoupment',
                        type: 'Statement PDF',
                        filename: '2025-Q3-meridian-statement.pdf'
                    }
                ]
            }
        ]
    }
};

export const referenceCmoConnectionsResponse = {
    data: [
        {
            cmoRegId: 'rh-reg-001',
            cmoId: 'cmo-ppl',
            cmoName: 'PPL',
            territoriesCodes: ['GB', 'IE'],
            territoriesToShow: 'United Kingdom, Ireland',
            startDate: '2023-04-01',
            endDate: '2026-03-31',
            registrationStatus: 'REGISTERED',
            statusDate: '2026-03-12T16:45:00Z',
            commentPresented: false,
            status: 'active',
            acceptableRegistrationStatuses: ['TO_BE_REGISTERED', 'EXPORTED'],
            alertCategories: []
        },
        {
            cmoRegId: 'rh-reg-002',
            cmoId: 'cmo-gramex',
            cmoName: 'Gramex',
            territoriesCodes: ['FI', 'DK'],
            territoriesToShow: 'Finland, Denmark',
            startDate: '2024-01-15',
            endDate: '2027-01-14',
            registrationStatus: 'SUBMITTED',
            statusDate: '2026-02-21T11:30:00Z',
            commentPresented: true,
            status: 'active',
            acceptableRegistrationStatuses: ['REGISTERED', 'REJECTED'],
            alertCategories: ['CLIENT']
        },
        {
            cmoRegId: 'rh-reg-003',
            cmoId: 'cmo-sena',
            cmoName: 'SENA',
            territoriesCodes: ['NL'],
            territoriesToShow: 'Netherlands',
            startDate: '2025-02-01',
            endDate: '2027-12-31',
            registrationStatus: 'TO_BE_REGISTERED',
            statusDate: '2026-04-05T09:12:00Z',
            commentPresented: false,
            status: 'pending',
            acceptableRegistrationStatuses: ['SUBMITTED', 'EXPORTED'],
            alertCategories: ['CMO']
        }
    ]
};

export const referenceRegistrationHistoryResponse = {
    requestUUID: 'reference-registration-history',
    data: [
        {
            date: '2026-04-05T09:12:00Z',
            user: 'Operations user',
            previousStatus: 'SUBMITTED',
            currentStatus: 'TO_BE_REGISTERED'
        },
        {
            date: '2026-02-21T11:30:00Z',
            user: 'Ari Foster',
            previousStatus: 'EXPORTED',
            currentStatus: 'SUBMITTED'
        }
    ]
};

export const referenceAlertsResponse = {
    requestUUID: 'reference-alert-request',
    data: [
        {
            regAlertId: 'alert-001',
            message: 'Client-side documentation is still required before registration can continue.',
            category: 'CLIENT',
            resolved: false
        }
    ]
};

export const referenceCsvExport = 'isrc,title,artist\nGBKPL2400011,Afterimage,Nova Vale\n';
