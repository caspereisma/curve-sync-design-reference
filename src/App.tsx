import React, { useMemo, useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { HashRouter, Link, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { GlobalStyleOverrides, theme } from './styling/muiThemes/FugaMainStyles';

import { referenceRightsHolders } from './mocks/referenceUiData';
import ReferenceClientPage from './pages/ReferenceClientPage';
import ReferenceClientsPage from './pages/ReferenceClientsPage';

import './reference-ui.css';

interface NavItem {
    label: string;
    href: string;
    isActive?: boolean;
    hasMenu?: boolean;
}

type AssetSyncMode = 'newly-ingested' | 'all-assets';

type AssetSyncStatus = 'pending' | 'Sync completed' | 'Partially synced' | 'Sync failed';

interface FailedAsset {
    isrc: string;
    title: string;
    error: string;
}

interface ClientAssetSyncSummary {
    clientId: string;
    clientName: string;
    status: AssetSyncStatus;
    processedAssetsCount: number;
    createdAssetsCount: number;
    updatedAssetsCount: number;
    failedAssetsCount: number;
    failedAssets: FailedAsset[];
}

interface AssetSyncEvent {
    id: string;
    description: string;
    mode: AssetSyncMode;
    excludedClientIds: string[];
    summary: ClientAssetSyncSummary[];
    user: string;
    date: string;
    status: AssetSyncStatus;
}

interface ReferenceTopBarProps {
    onOpenAssetSync: () => void;
}

interface AssetSyncDialogProps {
    mode: AssetSyncMode;
    open: boolean;
    onClose: () => void;
    onModeChange: (_mode: AssetSyncMode) => void;
    onSubmit: () => void;
}

interface ReferenceEventsPageProps {
    events: AssetSyncEvent[];
}

const referenceEvents: AssetSyncEvent[] = [
    {
        id: 'event-reference-1',
        description: 'Curve sync 1040 tracks for Hexagon Label B.V.',
        mode: 'all-assets',
        excludedClientIds: [],
        summary: [
            {
                clientId: 'hexagon-label',
                clientName: 'Hexagon Label B.V.',
                status: 'Partially synced',
                processedAssetsCount: 1040,
                createdAssetsCount: 0,
                updatedAssetsCount: 1040,
                failedAssetsCount: 126,
                failedAssets: [
                    {
                        isrc: 'NL1ZN2503689',
                        title: 'House Music Speaks',
                        error: "The ISRC 'NL1ZN2503689' matches the ISRC on an existing Curve track."
                    },
                    {
                        isrc: 'NL1ZN2503693',
                        title: 'Jump Into The Bag',
                        error: "The ISRC 'NL1ZN2503693' matches the ISRC on an existing Curve track."
                    },
                    {
                        isrc: 'NL1ZN2503640',
                        title: 'Disconnected',
                        error: "The ISRC 'NL1ZN2503640' matches the ISRC on an existing Curve track."
                    }
                ]
            },
            {
                clientId: 'hexagon-publishing',
                clientName: 'Hexagon Publishing',
                status: 'Sync completed',
                processedAssetsCount: 86,
                createdAssetsCount: 12,
                updatedAssetsCount: 74,
                failedAssetsCount: 0,
                failedAssets: []
            }
        ],
        user: 'Jill Culton',
        date: '17/03/2026 22:43',
        status: 'Partially synced'
    },
    {
        id: 'event-reference-2',
        description: 'Curve sync 22 tracks for Kylie Ann Minogue',
        mode: 'newly-ingested',
        excludedClientIds: [],
        summary: [
            {
                clientId: 'kylie-ann-minogue',
                clientName: 'Kylie Ann Minogue',
                status: 'Sync completed',
                processedAssetsCount: 22,
                createdAssetsCount: 22,
                updatedAssetsCount: 0,
                failedAssetsCount: 0,
                failedAssets: []
            }
        ],
        user: 'Jill Culton',
        date: '16/03/2026 10:22',
        status: 'Sync completed'
    },
    {
        id: 'event-reference-3',
        description: 'Curve sync 95 tracks for FADER Label',
        mode: 'newly-ingested',
        excludedClientIds: [],
        summary: [
            {
                clientId: 'fader-label',
                clientName: 'FADER Label',
                status: 'Sync completed',
                processedAssetsCount: 95,
                createdAssetsCount: 95,
                updatedAssetsCount: 0,
                failedAssetsCount: 0,
                failedAssets: []
            }
        ],
        user: 'Jill Culton',
        date: '11/03/2026 09:24',
        status: 'Sync completed'
    },
    {
        id: 'event-reference-4',
        description: 'Curve sync 1040 tracks for Hexagon Label B.V.',
        mode: 'all-assets',
        excludedClientIds: [],
        summary: [
            {
                clientId: 'hexagon-label-batch-2',
                clientName: 'Hexagon Label B.V.',
                status: 'Partially synced',
                processedAssetsCount: 1040,
                createdAssetsCount: 0,
                updatedAssetsCount: 1038,
                failedAssetsCount: 2,
                failedAssets: [
                    {
                        isrc: 'NL1ZN2503654',
                        title: 'Smash The Disco',
                        error: "The ISRC 'NL1ZN2503654' matches the ISRC on an existing Curve track."
                    },
                    {
                        isrc: 'NL1ZN2503638',
                        title: 'Hold Me',
                        error: "The ISRC 'NL1ZN2503638' matches the ISRC on an existing Curve track."
                    }
                ]
            }
        ],
        user: 'Jill Culton',
        date: '11/03/2026 09:23',
        status: 'Partially synced'
    },
    {
        id: 'event-reference-5',
        description: 'Curve sync 0 tracks for SUB POP RECORDS',
        mode: 'newly-ingested',
        excludedClientIds: [],
        summary: [
            {
                clientId: 'sub-pop-records',
                clientName: 'SUB POP RECORDS',
                status: 'Sync failed',
                processedAssetsCount: 0,
                createdAssetsCount: 0,
                updatedAssetsCount: 0,
                failedAssetsCount: 1,
                failedAssets: [
                    {
                        isrc: 'N/A',
                        title: 'Client repertoire export',
                        error: 'Curve sync failed before asset processing started.'
                    }
                ]
            }
        ],
        user: 'Jill Culton',
        date: '11/03/2026 09:22',
        status: 'Sync failed'
    }
];

function ReferenceTopBar({ onOpenAssetSync }: ReferenceTopBarProps): React.ReactElement {
    const location = useLocation();
    const navItems: NavItem[] = [
        { label: 'CMOs', href: '/cmos' },
        {
            label: 'Clients',
            href: '/rights-holders',
            isActive:
                location.pathname.startsWith('/rights-holders') ||
                location.pathname.startsWith('/rights-holder-page'),
            hasMenu: true
        },
        { label: 'User management', href: '/users' },
        { label: 'Events', href: '/events' }
    ];

    return (
        <header className="reference-topbar">
            <div className="reference-topbar-left">
                <Link className="reference-brand" to="/rights-holders" aria-label="Neighbouring Rights">
                    <span className="reference-brand-mark" aria-hidden="true" />
                    <span>
                        <span className="reference-brand-name">NEIGHBOURING RIGHTS</span>
                        <span className="reference-brand-powered">Powered by FUGA</span>
                    </span>
                </Link>
                <nav aria-label="Primary">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            className={`reference-nav-link${item.isActive ? ' active' : ''}`}
                            to={item.href}
                        >
                            {item.label}
                            {item.hasMenu && <ExpandMoreIcon sx={{ fontSize: 16, marginLeft: 0.5 }} />}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="reference-topbar-right">
                <Tooltip title="Imports">
                    <IconButton className="reference-topbar-icon" size="small" aria-label="Imports">
                        <CloudUploadIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Sync all assets with Curve">
                    <IconButton
                        className="reference-topbar-icon"
                        size="small"
                        aria-label="Sync all assets with Curve"
                        onClick={onOpenAssetSync}
                    >
                        <SyncIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Notifications">
                    <IconButton className="reference-topbar-icon" size="small" aria-label="Notifications">
                        <NotificationsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Account">
                    <IconButton className="reference-topbar-icon" size="small" aria-label="Account">
                        <AccountCircleIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>
        </header>
    );
}

function AssetSyncDialog({
    mode,
    open,
    onClose,
    onModeChange,
    onSubmit
}: AssetSyncDialogProps): React.ReactElement {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            aria-labelledby="asset-sync-dialog-title"
            PaperProps={{ className: 'reference-asset-sync-dialog-paper' }}
        >
            <DialogTitle id="asset-sync-dialog-title">Sync all assets with Curve</DialogTitle>
            <DialogContent dividers>
                <div className="reference-asset-sync-modal">
                    <section>
                        <h3>Sync scope</h3>
                        <div className="reference-asset-sync-options" role="radiogroup" aria-label="Asset sync scope">
                            <label className={`reference-asset-sync-option${mode === 'newly-ingested' ? ' selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="asset-sync-mode"
                                    checked={mode === 'newly-ingested'}
                                    onChange={() => onModeChange('newly-ingested')}
                                />
                                <span>
                                    <strong>Sync only newly ingested assets</strong>
                                    <small>Assets without any Curve reference will be created on the Curve side.</small>
                                </span>
                            </label>
                            <label className={`reference-asset-sync-option${mode === 'all-assets' ? ' selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="asset-sync-mode"
                                    checked={mode === 'all-assets'}
                                    onChange={() => onModeChange('all-assets')}
                                />
                                <span>
                                    <strong>Sync all assets</strong>
                                    <small>Force update existing assets and create missing Curve references.</small>
                                </span>
                            </label>
                        </div>
                    </section>

                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={onSubmit}>
                    Create async action
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function getSummaryTotals(summary: ClientAssetSyncSummary[]): Omit<ClientAssetSyncSummary, 'clientId' | 'clientName' | 'failedAssets' | 'status'> {
    return summary.reduce(
        (totals, clientSummary) => ({
            processedAssetsCount: totals.processedAssetsCount + clientSummary.processedAssetsCount,
            createdAssetsCount: totals.createdAssetsCount + clientSummary.createdAssetsCount,
            updatedAssetsCount: totals.updatedAssetsCount + clientSummary.updatedAssetsCount,
            failedAssetsCount: totals.failedAssetsCount + clientSummary.failedAssetsCount
        }),
        {
            processedAssetsCount: 0,
            createdAssetsCount: 0,
            updatedAssetsCount: 0,
            failedAssetsCount: 0
        }
    );
}

function EventDetailsDialog({
    event,
    onClose
}: {
    event: AssetSyncEvent | null;
    onClose: () => void;
}): React.ReactElement {
    const totals = getSummaryTotals(event?.summary ?? []);
    const isSingleClient = (event?.summary.length ?? 0) === 1;
    const subjectName = isSingleClient ? event?.summary[0]?.clientName : 'all clients';
    const titleText = subjectName ? `Curve sync details — ${subjectName}` : 'Curve sync details';

    return (
        <Dialog
            open={event !== null}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            aria-labelledby="event-details-dialog-title"
            PaperProps={{ className: 'reference-event-details-dialog-paper' }}
        >
            <DialogTitle id="event-details-dialog-title">{titleText}</DialogTitle>
            <DialogContent dividers>
                {event && (
                    <div className="reference-event-details-modal">
                        <div className="reference-event-summary-cards">
                            <div>
                                <span>Processed</span>
                                <strong>{totals.processedAssetsCount.toLocaleString()}</strong>
                            </div>
                            <div>
                                <span>Created</span>
                                <strong>{totals.createdAssetsCount.toLocaleString()}</strong>
                            </div>
                            <div>
                                <span>Updated</span>
                                <strong>{totals.updatedAssetsCount.toLocaleString()}</strong>
                            </div>
                            <div className={totals.failedAssetsCount > 0 ? 'attention' : ''}>
                                <span>Existing skipped</span>
                                <strong>{totals.failedAssetsCount.toLocaleString()}</strong>
                            </div>
                        </div>

                        {!isSingleClient && (
                            <section>
                                <h3>Client summary</h3>
                                <div className="reference-event-client-summary">
                                    <div className="reference-event-summary-context">
                                        <span>CURVE_SYNC</span>
                                        <strong>{event.description}</strong>
                                        <span className={`reference-event-status ${event.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="reference-event-client-summary-row client-summary-header">
                                        <div>Client</div>
                                        <div>Processed</div>
                                        <div>Created</div>
                                        <div>Updated</div>
                                        <div>Existing skipped</div>
                                        <div>Status</div>
                                    </div>
                                    {event.summary.map((clientSummary) => (
                                        <div key={clientSummary.clientId} className="reference-event-client-summary-row">
                                            <div>{clientSummary.clientName}</div>
                                            <div>{clientSummary.processedAssetsCount.toLocaleString()}</div>
                                            <div>{clientSummary.createdAssetsCount.toLocaleString()}</div>
                                            <div>{clientSummary.updatedAssetsCount.toLocaleString()}</div>
                                            <div>{clientSummary.failedAssetsCount.toLocaleString()}</div>
                                            <div>
                                                <span
                                                    className={`reference-event-status ${clientSummary.status.toLowerCase().replace(/\s+/g, '-')}`}
                                                >
                                                    {clientSummary.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ReferenceEventsPage({ events }: ReferenceEventsPageProps): React.ReactElement {
    const allEvents = useMemo(() => [...events, ...referenceEvents], [events]);
    const [selectedEvent, setSelectedEvent] = useState<AssetSyncEvent | null>(null);

    return (
        <section className="reference-page reference-events-page">
            <div className="reference-breadcrumbs">Events</div>
            <h1 className="reference-page-title">Events</h1>

            <label className="reference-events-search">
                <SearchIcon fontSize="small" />
                <input placeholder="Search Events" aria-label="Search Events" />
            </label>

            <div className="reference-filters reference-events-filters" aria-label="Event filters">
                <span>Filters:</span>
                <button type="button" className="reference-filter-chip">Exports</button>
                <button type="button" className="reference-filter-chip">Ingestions</button>
                <button type="button" className="reference-filter-chip">Extracts</button>
                <button type="button" className="reference-filter-chip">Bulk Actions</button>
                <button type="button" className="reference-filter-chip active">Curve Sync ×</button>
                <button type="button" className="reference-filter-chip">User</button>
                <button type="button" className="reference-clear">Clear all</button>
            </div>

            <div className="reference-table">
                <div className="reference-table-row reference-table-header events-grid">
                    <div className="reference-table-cell">Event</div>
                    <div className="reference-table-cell">Description</div>
                    <div className="reference-table-cell">User</div>
                    <div className="reference-table-cell">Date</div>
                    <div className="reference-table-cell">Status</div>
                    <div className="reference-table-cell" aria-label="Details" />
                </div>
                {allEvents.map((event) => (
                    <div key={event.id} className="reference-table-row events-grid">
                        <div className="reference-table-cell reference-event-type">
                            <SyncIcon fontSize="small" />
                            CURVE_SYNC
                        </div>
                        <div className="reference-table-cell">
                            {event.description}
                            {event.excludedClientIds.length > 0 && (
                                <span className="reference-event-note">
                                    {' '}
                                    Excluded {event.excludedClientIds.length} clients.
                                </span>
                            )}
                        </div>
                        <div className="reference-table-cell">{event.user}</div>
                        <div className="reference-table-cell">{event.date}</div>
                        <div className="reference-table-cell">
                            <span className={`reference-event-status ${event.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {event.status}
                            </span>
                        </div>
                        <div className="reference-table-cell reference-event-details">
                            <IconButton
                                size="small"
                                aria-label={`Open details for ${event.description}`}
                                onClick={() => setSelectedEvent(event)}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>

            <div className="reference-pagination">Rows per page: 100 · 1–{allEvents.length} of {allEvents.length}</div>
            <EventDetailsDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </section>
    );
}

function ReferenceShell(): React.ReactElement {
    const history = useHistory();
    const [assetSyncDialogOpen, setAssetSyncDialogOpen] = useState(false);
    const [assetSyncMode, setAssetSyncMode] = useState<AssetSyncMode>('newly-ingested');
    const [assetSyncEvents, setAssetSyncEvents] = useState<AssetSyncEvent[]>([]);

    const createAssetSyncEvent = (): void => {
        const syncTarget = assetSyncMode === 'all-assets' ? 'all assets' : 'newly ingested assets';
        const description = `Curve sync ${syncTarget} for all clients`;
        const pendingSummary = referenceRightsHolders.slice(0, 6).map((client) => ({
            clientId: client.id,
            clientName: client.clientName,
            status: 'pending' as AssetSyncStatus,
            processedAssetsCount: 0,
            createdAssetsCount: 0,
            updatedAssetsCount: 0,
            failedAssetsCount: 0,
            failedAssets: []
        }));

        setAssetSyncEvents((currentEvents) => [
            {
                id: `event-created-${currentEvents.length + 1}`,
                description,
                mode: assetSyncMode,
                excludedClientIds: [],
                summary: pendingSummary,
                user: 'Admin User',
                date: '28/04/2026 15:00',
                status: 'pending'
            },
            ...currentEvents
        ]);
        setAssetSyncDialogOpen(false);
        history.push('/events');
    };

    return (
        <div className="reference-shell">
            <ReferenceTopBar onOpenAssetSync={() => setAssetSyncDialogOpen(true)} />
            <main>
                <Switch>
                    <Route exact path="/">
                        <Redirect to="/rights-holders" />
                    </Route>
                    <Route exact path="/clients">
                        <Redirect to="/rights-holders" />
                    </Route>
                    <Route exact path="/rights-holders">
                        <ReferenceClientsPage />
                    </Route>
                    <Route
                        exact
                        path="/rights-holders/:id"
                        render={({ match }) => (
                            <Redirect to={`/rights-holder-page/${match.params.id}`} />
                        )}
                    />
                    <Route exact path="/rights-holder-page/:id">
                        <ReferenceClientPage />
                    </Route>
                    <Route exact path="/events">
                        <ReferenceEventsPage events={assetSyncEvents} />
                    </Route>
                    <Route>
                        <Redirect to="/rights-holders" />
                    </Route>
                </Switch>
            </main>
            <AssetSyncDialog
                mode={assetSyncMode}
                open={assetSyncDialogOpen}
                onClose={() => setAssetSyncDialogOpen(false)}
                onModeChange={setAssetSyncMode}
                onSubmit={createAssetSyncEvent}
            />
        </div>
    );
}

function ReferenceApp(): React.ReactElement {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyleOverrides />
                <Box className="reference-app">
                    <HashRouter>
                        <ReferenceShell />
                    </HashRouter>
                </Box>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default ReferenceApp;
