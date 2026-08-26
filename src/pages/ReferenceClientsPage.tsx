import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link as RouterLink } from 'react-router-dom';

import { SlidingScaleDiamond } from '../components/SlidingScaleDiamond';
import { SyncStateIndicator, syncStateLabels } from '../components/SyncStateIndicator';
import { referenceRightsHolders } from '../mocks/referenceUiData';
import type { RegistrationSegment, RightsHolderClient, SyncState } from '../mocks/referenceUiData';

function computeSyncState(client: RightsHolderClient): SyncState {
    const allStates = [client.syncState, ...client.territoryDeals.map((d) => d.syncState)];
    if (allStates.some((s) => s === 'requires-sync')) return 'requires-sync';
    if (allStates.every((s) => s === 'synced')) return 'synced';
    return 'not-synced';
}

type DealIndicator =
    | 'advance-recouped'
    | 'advance-in-recoupment'
    | 'sliding-passed'
    | 'sliding-not-passed'
    | null;

interface DealEndMeta {
    endDateLabel: string;
    daysLabel: string;
    isEndingSoon: boolean;
    indicator: DealIndicator;
}

// Dummy data: cycle rows through the 30/60/90/>90 day buckets (groups of three,
// mirroring the Figma example) and alternate advance/sliding indicators. A client
// has either an advance (dot) or a sliding scale (diamond), never both.
const dayBuckets = [30, 60, 90, 180] as const;
const indicatorCycle: DealIndicator[] = [
    'advance-recouped',
    'sliding-passed',
    'advance-in-recoupment',
    null,
    'sliding-not-passed',
    null
];

function getDealEndMeta(index: number): DealEndMeta {
    const days = dayBuckets[Math.floor(index / 3) % dayBuckets.length];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return {
        endDateLabel: endDate.toISOString().slice(0, 10),
        daysLabel: days > 90 ? '>90 days' : `${days} days`,
        isEndingSoon: days <= 30,
        indicator: indicatorCycle[index % indicatorCycle.length]
    };
}

function DealIndicatorIcon({ indicator }: { indicator: DealIndicator }): React.ReactElement | null {
    if (!indicator) {
        return null;
    }
    if (indicator === 'sliding-passed' || indicator === 'sliding-not-passed') {
        return <SlidingScaleDiamond passed={indicator === 'sliding-passed'} />;
    }
    const status = indicator === 'advance-recouped' ? 'green' : 'orange';
    const label = indicator === 'advance-recouped' ? 'Advance recouped' : 'Advance in recoupment';

    return <span className={`reference-indicator-dot ${status}`} role="img" aria-label={label} title={label} />;
}

const segmentColorClass = (segment: RegistrationSegment): string =>
    `registration-segment ${segment.color}`;

function RegistrationBar({
    segments
}: {
    segments: RegistrationSegment[];
}): React.ReactElement {
    const isEmpty = segments.every((segment) => segment.color === 'empty');

    return (
        <div className={`registration-bar${isEmpty ? ' empty' : ''}`} aria-label="Client registrations">
            {segments.map((segment, index) => (
                <span
                    key={`${segment.color}-${index}`}
                    className={segmentColorClass(segment)}
                    style={{ width: `${segment.value}%` }}
                />
            ))}
        </div>
    );
}

function ReferenceClientsPage(): React.ReactElement {
    const [syncStateFilter, setSyncStateFilter] = useState<SyncState | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [dismissedFlagIds, setDismissedFlagIds] = useState<string[]>([]);

    const filteredClients = syncStateFilter
        ? referenceRightsHolders.filter((c) => computeSyncState(c) === syncStateFilter)
        : referenceRightsHolders;

    const dismissFlag = (clientId: string): void => {
        setDismissedFlagIds((ids) => (ids.includes(clientId) ? ids : [...ids, clientId]));
    };

    return (
        <section className="reference-page">
            <div className="reference-breadcrumbs">
                <span>Clients</span>
                <span>/</span>
                <strong>Rights Holders</strong>
            </div>

            <div className="reference-title-row">
                <h1 className="reference-page-title">Rights Holders</h1>
                <div className="reference-actions">
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<DownloadIcon />}
                        sx={{
                            borderColor: '#3f3f43',
                            color: '#222222',
                            fontSize: 12,
                            fontWeight: 800,
                            minHeight: 34,
                            letterSpacing: 0
                        }}
                    >
                        Export all repertoire
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: '#3f3f43',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 800,
                            minHeight: 34,
                            letterSpacing: 0,
                            '&:hover': {
                                backgroundColor: '#2f2f32'
                            }
                        }}
                    >
                        Create rights holder
                    </Button>
                </div>
            </div>

            <div className="reference-filter-row">
                <span>Filters:</span>
                <button className="reference-filter-chip" type="button">
                    CMO Name
                </button>
                <button className="reference-filter-chip" type="button">
                    Statuses
                </button>
                <button className="reference-filter-chip" type="button">
                    Alerts
                </button>
                <button
                    className={`reference-filter-chip${syncStateFilter ? ' active' : ''}`}
                    type="button"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                    {syncStateFilter ? syncStateLabels[syncStateFilter] : 'Sync State'}
                </button>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuItem
                        selected={syncStateFilter === null}
                        onClick={() => { setSyncStateFilter(null); setMenuAnchor(null); }}
                    >
                        All
                    </MenuItem>
                    <MenuItem
                        selected={syncStateFilter === 'synced'}
                        onClick={() => { setSyncStateFilter('synced'); setMenuAnchor(null); }}
                    >
                        Synced
                    </MenuItem>
                    <MenuItem
                        selected={syncStateFilter === 'not-synced'}
                        onClick={() => { setSyncStateFilter('not-synced'); setMenuAnchor(null); }}
                    >
                        Not synced
                    </MenuItem>
                    <MenuItem
                        selected={syncStateFilter === 'requires-sync'}
                        onClick={() => { setSyncStateFilter('requires-sync'); setMenuAnchor(null); }}
                    >
                        Requires sync
                    </MenuItem>
                </Menu>
                <button
                    className="reference-clear"
                    type="button"
                    onClick={() => setSyncStateFilter(null)}
                >
                    Clear all
                </button>
            </div>

            <div className="reference-table" role="table" aria-label="Rights holders">
                <div className="reference-table-row reference-table-header rights-holder-grid" role="row">
                    <div className="reference-table-cell" role="columnheader">
                        Client Name
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Tier
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Deal start date
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Deal end date
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Client
                        <br />
                        registrations
                    </div>
                    <div className="reference-table-cell" role="columnheader" aria-label="Deal indicators" />
                </div>
                {filteredClients.map((client, index) => {
                    const dealEnd = getDealEndMeta(index);
                    const showFlag = dealEnd.isEndingSoon && !dismissedFlagIds.includes(client.id);

                    return (
                        <RouterLink
                            key={client.id}
                            className="reference-table-row clickable rights-holder-grid reference-table-link"
                            role="row"
                            to={`/rights-holder-page/${client.id}`}
                        >
                            <div className="reference-table-cell reference-table-name-cell" role="cell">
                                <span>{client.clientName}</span>
                            </div>
                            <div className="reference-table-cell" role="cell">
                                {client.tier}
                            </div>
                            <div className="reference-table-cell" role="cell">
                                {client.dealStartDate}
                            </div>
                            <div className="reference-table-cell reference-deal-end-cell" role="cell">
                                <span>{dealEnd.endDateLabel}</span>
                                <small>{dealEnd.daysLabel}</small>
                            </div>
                            <div className="reference-table-cell" role="cell">
                                <RegistrationBar segments={client.registrations} />
                            </div>
                            <div className="reference-table-cell reference-row-icons" role="cell" aria-label="Deal indicators">
                                <span className="reference-row-icon-slot">
                                    {showFlag && (
                                        <button
                                            type="button"
                                            className="reference-icon-button reference-flag-button"
                                            aria-label={`Dismiss deal ending flag for ${client.clientName}`}
                                            title="Deal ends within 30 days"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                dismissFlag(client.id);
                                            }}
                                        >
                                            <OutlinedFlagIcon sx={{ fontSize: 18 }} />
                                        </button>
                                    )}
                                </span>
                                <span className="reference-row-icon-slot">
                                    <SyncStateIndicator state={computeSyncState(client)} />
                                </span>
                                <span className="reference-row-icon-slot">
                                    <DealIndicatorIcon indicator={dealEnd.indicator} />
                                </span>
                            </div>
                        </RouterLink>
                    );
                })}
            </div>
        </section>
    );
}

export default ReferenceClientsPage;
