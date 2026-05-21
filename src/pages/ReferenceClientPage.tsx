import React, { useEffect, useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, useParams } from 'react-router-dom';

import { SyncStateIndicator, syncStateLabels } from '../components/SyncStateIndicator';
import {
    getReferenceRightsHolderById,
    referenceCurveSyncData,
    type CmoRegistration,
    type CurveSalesTermPriceCategory,
    type RecoupmentState,
    type ReferenceCurveSalesTerm,
    type RepertoireAsset,
    type RightsHolderClient,
    type RightsHolderClientDetails,
    type StatementSummary,
    type SyncState,
    type TerritoryDeal
} from '../mocks/referenceUiData';

type ClientTab = 'main' | 'repertoire' | 'statements' | 'cmos';
type CurveSyncScope = 'client' | 'deals';

interface DetailFieldProps {
    label: string;
    value?: string;
    editable?: boolean;
    full?: boolean;
    icon?: React.ReactNode;
    multiline?: boolean;
    outOfSync?: boolean;
    onChange?: (_value: string) => void;
}

const tabByIndex: ClientTab[] = ['main', 'repertoire', 'statements', 'cmos'];
const mainDetailSections = [
    { id: 'general', label: 'General' },
    { id: 'identifiers', label: 'Identifiers' },
    { id: 'contacts', label: 'Contacts & Users' },
    { id: 'deal-terms', label: 'Deal Terms' },
    { id: 'billing', label: 'Billing' },
    { id: 'comments', label: 'Comments' }
];
const recoupmentOptions: Array<{ value: RecoupmentState; label: string }> = [
    { value: 'in-recoupment', label: 'In recoupment' },
    { value: 'post-recoupment', label: 'Post-recoupment' },
    { value: 'just-recouped', label: 'Just recouped' }
];

const cloneRightsHolderClient = (client: RightsHolderClient): RightsHolderClient => ({
    ...client,
    details: { ...client.details },
    territoryDeals: client.territoryDeals.map((deal) => ({
        ...deal,
        slidingScale: deal.slidingScale?.map((tier) => ({ ...tier }))
    })),
    repertoireAssets: client.repertoireAssets.map((asset) => ({ ...asset })),
    statements: client.statements.map((statement) => ({
        ...statement,
        files: statement.files.map((file) => ({ ...file }))
    })),
    cmoRegistrations: client.cmoRegistrations.map((registration) => ({ ...registration }))
});

function DetailField({
    label,
    value = '',
    editable = false,
    full = false,
    icon,
    multiline = false,
    outOfSync = false,
    onChange
}: DetailFieldProps): React.ReactElement {
    return (
        <div className={`reference-field${full ? ' full' : ''}`}>
            <span className="reference-field-label">{label}</span>
            <div className={`reference-field-value${multiline ? ' multiline' : ''}`}>
                {editable ? (
                    multiline ? (
                        <textarea
                            aria-label={label}
                            className="reference-field-input multiline"
                            value={value}
                            onChange={(event) => onChange?.(event.target.value)}
                        />
                    ) : (
                        <input
                            aria-label={label}
                            className="reference-field-input"
                            value={value}
                            onChange={(event) => onChange?.(event.target.value)}
                        />
                    )
                ) : (
                    <span>{value}</span>
                )}
                {icon}
            </div>
            {outOfSync && (
                <span className="reference-field-helper" role="status">
                    <SyncIcon sx={{ fontSize: 14 }} />
                    Updated, out of sync with Curve
                </span>
            )}
        </div>
    );
}

function DetailPlaceholder(): React.ReactElement {
    return <div className="reference-field-placeholder" aria-hidden="true" />;
}

function SelectLikeField({
    label,
    value,
    editable,
    onChange
}: Pick<DetailFieldProps, 'editable' | 'label' | 'onChange' | 'value'>): React.ReactElement {
    return (
        <DetailField
            label={label}
            value={value}
            editable={editable}
            onChange={onChange}
            icon={!editable && <KeyboardArrowDownIcon sx={{ marginLeft: 'auto', fontSize: 18, color: '#777' }} />}
        />
    );
}

function InlineCheckboxField({
    label,
    checked,
    muted = false
}: {
    label: string;
    checked?: boolean;
    muted?: boolean;
}): React.ReactElement {
    return (
        <label className={`reference-inline-control${muted ? ' muted' : ''}`}>
            <Checkbox size="small" checked={checked} disabled />
            <span>{label}</span>
        </label>
    );
}

function AutoExtendField(): React.ReactElement {
    return (
        <div className="reference-composite-field">
            <InlineCheckboxField label="Auto extend" muted />
            <span className="reference-composite-label">Every</span>
            <span className="reference-small-select disabled" aria-label="Auto extend count">
                <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#777' }} />
            </span>
            <span className="reference-small-select disabled" aria-label="Auto extend unit">
                <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#777' }} />
            </span>
        </div>
    );
}

function AdvanceField(): React.ReactElement {
    return (
        <div className="reference-composite-field">
            <InlineCheckboxField label="Advance" checked />
            <div className="reference-amount-field">
                <span className="reference-field-label">Amount</span>
                <div className="reference-field-value">
                    <span>€50,000</span>
                </div>
            </div>
        </div>
    );
}

function TerritoryDealsTable({
    deals,
    accountBalance,
    onEditDeal
}: {
    deals: TerritoryDeal[];
    accountBalance: string;
    onEditDeal: (_deal: TerritoryDeal) => void;
}): React.ReactElement {
    return (
        <div className="reference-table reference-territory-table" role="table" aria-label="Territory deals">
            <div className="reference-table-row reference-table-header territory-deal-grid" role="row">
                <div className="reference-table-cell" role="columnheader">
                    Territories
                </div>
                <div className="reference-table-cell" role="columnheader">
                    Rate
                </div>
                <div className="reference-table-cell" role="columnheader">
                    Start Date
                </div>
                <div className="reference-table-cell" role="columnheader">
                    End Date
                </div>
                <div className="reference-table-cell" role="columnheader">
                    Status
                </div>
                <div className="reference-table-cell" role="columnheader">
                    {' '}
                </div>
            </div>
            {deals.map((deal) => {
                const requiresSync = deal.syncState === 'requires-sync';
                return (
                <div
                    key={deal.id}
                    className={`reference-table-row territory-deal-grid${
                        requiresSync ? ' requires-sync' : ''
                    }`}
                    role="row"
                >
                    <div className="reference-table-cell" role="cell">
                        {deal.territories}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        <span>{getDealRateLabel(deal, accountBalance)}</span>
                        {requiresSync && (
                            <SyncIcon
                                sx={{ fontSize: 14, color: 'var(--nr-warning)', marginLeft: 0.5 }}
                                aria-label="Requires sync"
                            />
                        )}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        {deal.startDate}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        {deal.endDate}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        <span className={`reference-status ${deal.status.toLowerCase()}`}>{deal.status}</span>
                    </div>
                    <div className="reference-table-cell reference-table-icons" role="cell" aria-label="Deal actions">
                        <button
                            className="reference-icon-button"
                            type="button"
                            aria-label={`Edit ${deal.territories} ${deal.startDate} deal`}
                            onClick={() => onEditDeal(deal)}
                        >
                            <EditOutlinedIcon />
                        </button>
                        <DeleteOutlineIcon aria-label="Delete deal" />
                    </div>
                </div>
                );
            })}
        </div>
    );
}

function MainDetailsTab({
    client,
    dealSyncStates,
    isEditing,
    onClientFieldChange,
    onDetailFieldChange,
    onEditDeal,
    onOpenDealSync
}: {
    client: RightsHolderClient;
    dealSyncStates: Record<string, SyncState>;
    isEditing: boolean;
    onClientFieldChange: (_field: 'clientName' | 'dealStartDate' | 'tier', _value: string) => void;
    onDetailFieldChange: (_field: keyof RightsHolderClientDetails, _value: string) => void;
    onEditDeal: (_deal: TerritoryDeal) => void;
    onOpenDealSync: () => void;
}): React.ReactElement {
    const [activeSection, setActiveSection] = useState(mainDetailSections[0].id);
    const { details } = client;
    const updateDetail = (field: keyof RightsHolderClientDetails) => (value: string): void =>
        onDetailFieldChange(field, value);
    const updateClient = (field: 'clientName' | 'dealStartDate' | 'tier') => (value: string): void =>
        onClientFieldChange(field, value);

    return (
        <div className="reference-detail-content">
            <aside className="reference-side-nav" aria-label="Main details sections">
                {mainDetailSections.map((section) => (
                    <a
                        key={section.id}
                        className={activeSection === section.id ? 'active' : undefined}
                        href={`#${section.id}`}
                        onClick={(event) => {
                            event.preventDefault();
                            document
                                .getElementById(section.id)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setActiveSection(section.id);
                        }}
                    >
                        {section.label}
                    </a>
                ))}
            </aside>

            <div className="reference-form-content">
                <section className="reference-section" id="general">
                    <h2 className="reference-section-title">General</h2>
                    <div className="reference-field-grid">
                        <DetailField
                            label="Client Name/Legal Company *"
                            value={client.clientName}
                            editable={isEditing}
                            outOfSync
                            onChange={updateClient('clientName')}
                        />
                        <DetailPlaceholder />
                        <DetailField
                            label="Business Registered Address"
                            value={details.businessRegisteredAddress}
                            editable={isEditing}
                            multiline
                            onChange={updateDetail('businessRegisteredAddress')}
                        />
                        <DetailField
                            label="Business Mailing Address"
                            value={details.businessMailingAddress}
                            editable={isEditing}
                            multiline
                            onChange={updateDetail('businessMailingAddress')}
                        />
                        <DetailField
                            label="Tier"
                            value={client.tier}
                            editable={isEditing}
                            onChange={updateClient('tier')}
                        />
                        <DetailField
                            label="Sub-labels"
                            value={details.subLabels}
                            editable={isEditing}
                            onChange={updateDetail('subLabels')}
                        />
                    </div>
                </section>

                <section className="reference-section" id="identifiers">
                    <h2 className="reference-section-title">Identifiers</h2>
                    <div className="reference-field-grid">
                        <DetailField
                            label="NRP Client ID"
                            value={details.nrpClientId}
                            editable={isEditing}
                            onChange={updateDetail('nrpClientId')}
                        />
                        <DetailPlaceholder />
                        <DetailField
                            label="FUGA Org ID"
                            value={details.fugaOrgId}
                            editable={isEditing}
                            onChange={updateDetail('fugaOrgId')}
                        />
                        <DetailField
                            label="DDEX Party ID"
                            value={details.ddexPartyId}
                            editable={isEditing}
                            onChange={updateDetail('ddexPartyId')}
                        />
                        <DetailField
                            label="Other Identifiers"
                            value={details.otherIdentifiers}
                            editable={isEditing}
                            onChange={updateDetail('otherIdentifiers')}
                        />
                        <DetailPlaceholder />
                        <DetailField
                            outOfSync
                            label="Royalties Client Name"
                            value={details.royaltiesClientName}
                            editable={isEditing}
                            onChange={updateDetail('royaltiesClientName')}
                        />
                        <DetailField
                            label="Royalties Contract Reference(s)"
                            value={details.royaltiesContractReferences}
                            editable={isEditing}
                            onChange={updateDetail('royaltiesContractReferences')}
                        />
                    </div>
                </section>

                <section className="reference-section" id="contacts">
                    <h2 className="reference-section-title">Contacts &amp; Users</h2>
                    <div className="reference-permissions-group">
                        <span className="reference-caption-with-icon">
                            External user access
                            <VisibilityIcon sx={{ fontSize: 17, color: '#777' }} />
                        </span>
                        <label>
                            <Checkbox size="small" disabled />
                            Repertoire
                        </label>
                        <label>
                            <Checkbox size="small" disabled />
                            Statements
                        </label>
                    </div>
                </section>

                <section className="reference-section" id="deal-terms">
                    <h2 className="reference-section-title">Deal Terms</h2>
                    <div className="reference-field-grid reference-deal-terms-grid">
                        <DetailField
                            label="Start Date"
                            value={client.dealStartDate}
                            editable={isEditing}
                            icon={!isEditing && <CalendarTodayIcon sx={{ marginLeft: 'auto', fontSize: 16, color: '#777' }} />}
                            onChange={updateClient('dealStartDate')}
                        />
                        <DetailField
                            label="End Date"
                            value={details.dealEndDate}
                            editable={isEditing}
                            icon={!isEditing && <CalendarTodayIcon sx={{ marginLeft: 'auto', fontSize: 16, color: '#777' }} />}
                            onChange={updateDetail('dealEndDate')}
                        />
                        <SelectLikeField
                            label="Accounting Frequency *"
                            value={details.accountingFrequency}
                            editable={isEditing}
                            onChange={updateDetail('accountingFrequency')}
                        />
                        <SelectLikeField
                            label="Currency *"
                            value={details.currency}
                            editable={isEditing}
                            onChange={updateDetail('currency')}
                        />
                        <AutoExtendField />
                        <SelectLikeField
                            label="Notice Period"
                            value={details.noticePeriod}
                            editable={isEditing}
                            onChange={updateDetail('noticePeriod')}
                        />
                        <AdvanceField />
                        <DetailPlaceholder />
                    </div>
                    <div className="reference-subsection-header">
                        <div className="reference-title-with-sync">
                            <h3>Territory Deals</h3>
                        </div>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<AddIcon />}
                            disabled
                            sx={{
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: 0,
                                minHeight: 34
                            }}
                        >
                            Add deal
                        </Button>
                    </div>
                    <TerritoryDealsTable
                        deals={client.territoryDeals}
                        accountBalance={details.accountBalance}
                        onEditDeal={onEditDeal}
                    />
                </section>

                <section className="reference-section" id="billing">
                    <h2 className="reference-section-title">Billing</h2>
                    <div className="reference-field-grid">
                        <DetailField
                            label="Bank account number"
                            value={details.bankAccountNumber}
                            editable={isEditing}
                            onChange={updateDetail('bankAccountNumber')}
                        />
                        <DetailField
                            label="Bank account payee"
                            value={details.bankAccountPayee}
                            editable={isEditing}
                            onChange={updateDetail('bankAccountPayee')}
                        />
                        <DetailField
                            label="Bank city"
                            value={details.bankCity}
                            editable={isEditing}
                            onChange={updateDetail('bankCity')}
                        />
                        <DetailField
                            label="Bank country"
                            outOfSync
                            value={details.bankCountry}
                            editable={isEditing}
                            onChange={updateDetail('bankCountry')}
                        />
                        <DetailField
                            label="Bank name"
                            value={details.bankName}
                            editable={isEditing}
                            onChange={updateDetail('bankName')}
                        />
                        <DetailField
                            label="Bank Swift number"
                            value={details.bankSwiftNumber}
                            editable={isEditing}
                            onChange={updateDetail('bankSwiftNumber')}
                        />
                        <DetailField
                            label="Bank IBAN number"
                            value={details.bankIbanNumber}
                            editable={isEditing}
                            onChange={updateDetail('bankIbanNumber')}
                        />
                    </div>
                </section>

                <section className="reference-section reference-section-last" id="comments">
                    <h2 className="reference-section-title">Comments</h2>
                    <div className="reference-field-grid">
                        <DetailField
                            label="comments"
                            value={details.comments}
                            editable={isEditing}
                            full
                            multiline
                            onChange={updateDetail('comments')}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function RepertoireTab({ assets }: { assets: RepertoireAsset[] }): React.ReactElement {
    const [syncStateFilter, setSyncStateFilter] = useState<SyncState | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const [isrcFilter, setIsrcFilter] = useState('');
    const [isrcAnchor, setIsrcAnchor] = useState<HTMLElement | null>(null);

    const globalSyncState = useMemo((): SyncState => {
        if (assets.length === 0) return 'not-synced';
        if (assets.some((a) => a.syncState === 'requires-sync')) return 'requires-sync';
        if (assets.every((a) => a.syncState === 'synced')) return 'synced';
        return 'not-synced';
    }, [assets]);

    const filteredAssets = assets.filter((a) => {
        if (syncStateFilter && a.syncState !== syncStateFilter) return false;
        if (isrcFilter && !a.isrc.toLowerCase().includes(isrcFilter.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="reference-content-panel">
            <div className="reference-toolbar">
                <TextField
                    className="reference-search"
                    size="small"
                    placeholder="Search in repertoire"
                    variant="outlined"
                />
                <div className="reference-toolbar-actions">
                    <Button
                        variant="contained"
                        startIcon={<SyncIcon />}
                        sx={{
                            backgroundColor: '#3f3f43',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: 0,
                            minHeight: 34,
                            '&:hover': { backgroundColor: '#2f2f32' },
                            '& .MuiSvgIcon-root': { color: '#ffffff' }
                        }}
                    >
                        Sync with Curve
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<DownloadIcon />}
                        sx={{
                            borderColor: '#3f3f43',
                            color: '#222222',
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: 0,
                            minHeight: 34
                        }}
                    >
                        Export repertoire
                    </Button>
                </div>
            </div>
            <div className="reference-filter-row">
                <span>Filters:</span>
                <button
                    className={`reference-filter-chip${isrcFilter ? ' active' : ''}`}
                    type="button"
                    onClick={(e) => setIsrcAnchor(e.currentTarget)}
                >
                    {isrcFilter ? `ISRC: ${isrcFilter}` : 'ISRC'}
                </button>
                <Popover
                    anchorEl={isrcAnchor}
                    open={Boolean(isrcAnchor)}
                    onClose={() => setIsrcAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 220 }}>
                        <TextField
                            size="small"
                            label="ISRC"
                            placeholder="e.g. GBNRP1700001"
                            value={isrcFilter}
                            onChange={(e) => setIsrcFilter(e.target.value)}
                            autoFocus
                        />
                        <button
                            className="reference-clear"
                            type="button"
                            onClick={() => { setIsrcFilter(''); setIsrcAnchor(null); }}
                        >
                            Clear
                        </button>
                    </div>
                </Popover>
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
                    onClick={() => { setSyncStateFilter(null); setIsrcFilter(''); }}
                >
                    Clear all
                </button>
            </div>
            <div className="reference-table" role="table" aria-label="Repertoire">
                <div className="reference-table-row reference-table-header asset-grid" role="row">
                    <div className="reference-table-cell" role="columnheader">
                        Artist(s)
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Track / Version
                    </div>
                    <div className="reference-table-cell" role="columnheader" aria-label="Sync state" />
                    <div className="reference-table-cell" role="columnheader">
                        ISRC
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Product
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Territories
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Start Date
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        End Date
                    </div>
                    <div className="reference-table-cell" role="columnheader" aria-label="Actions" />
                </div>
                {filteredAssets.map((asset) => (
                    <div key={asset.id} className="reference-table-row asset-grid" role="row">
                        <div className="reference-table-cell" role="cell">
                            {asset.artist}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            <span className="reference-track-content">
                                <span className="reference-track-title">{asset.title}</span>
                                {asset.version && (
                                    <span className="reference-track-version">{asset.version}</span>
                                )}
                            </span>
                        </div>
                        <div className="reference-table-cell reference-sync-column" role="cell">
                            <SyncStateIndicator state={asset.syncState} />
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {asset.isrc}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {asset.album}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {asset.territories}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {asset.startDate}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {asset.endDate}
                        </div>
                        <div className="reference-table-cell reference-row-actions" role="cell">
                            <button className="reference-row-menu-btn" type="button" aria-label="Row actions">
                                <MoreVertIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="reference-pagination">
                <span>Rows per page:</span>
                <select className="reference-pagination-select" defaultValue="10">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </select>
                <span>1–{filteredAssets.length} of {filteredAssets.length}</span>
                <button className="reference-pagination-btn" type="button" disabled aria-label="Previous page">&#8249;</button>
                <button className="reference-pagination-btn" type="button" disabled aria-label="Next page">&#8250;</button>
            </div>
        </div>
    );
}

const formatStatementSubtotal = (value: string): string => {
    const numericValue = Number(value.replace(/,/g, ''));

    if (!Number.isFinite(numericValue)) {
        return '0.00';
    }

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericValue);
};

const formatStatementRows = (statements: StatementSummary[]): StatementSummary[] =>
    statements.map((statement) => ({
        ...statement,
        subtotal: formatStatementSubtotal(statement.subtotal)
    }));

const formatStatementSubtotalInputValue = (statement: Pick<StatementSummary, 'currency' | 'subtotal'>): string =>
    `${statement.currency}${statement.currency && statement.subtotal ? ' ' : ''}${statement.subtotal}`;

const parseStatementSubtotalInputValue = (
    value: string,
    currentCurrency: string
): Pick<StatementSummary, 'currency' | 'subtotal'> => {
    const trimmedValue = value.trimStart();
    const numberStartIndex = trimmedValue.search(/[+-]?\d/);

    if (numberStartIndex === -1) {
        return {
            currency: trimmedValue.trim(),
            subtotal: ''
        };
    }

    return {
        currency: trimmedValue.slice(0, numberStartIndex).trim() || currentCurrency,
        subtotal: trimmedValue.slice(numberStartIndex).trim()
    };
};

function StatementsTab({ statements }: { statements: StatementSummary[] }): React.ReactElement {
    const [savedStatementRows, setSavedStatementRows] = useState<StatementSummary[]>(() =>
        formatStatementRows(statements)
    );
    const [statementRows, setStatementRows] = useState<StatementSummary[]>(() => formatStatementRows(statements));

    useEffect(() => {
        const nextRows = formatStatementRows(statements);
        setSavedStatementRows(nextRows);
        setStatementRows(nextRows);
    }, [statements]);

    const updateStatement = (
        statementId: string,
        updates: Partial<Pick<StatementSummary, 'currency' | 'expanded' | 'recoupmentState' | 'subtotal'>>
    ): void => {
        setStatementRows((rows) =>
            rows.map((statement) =>
                statement.id === statementId
                    ? {
                          ...statement,
                          ...updates
                      }
                    : statement
            )
        );
    };

    const rollbackStatement = (statementId: string): void => {
        const savedStatement = savedStatementRows.find((statement) => statement.id === statementId);

        if (savedStatement) {
            updateStatement(statementId, {
                currency: savedStatement.currency,
                subtotal: savedStatement.subtotal,
                recoupmentState: savedStatement.recoupmentState
            });
        }
    };

    const saveStatement = (statementId: string): void => {
        setStatementRows((rows) => {
            const formattedRows = rows.map((statement) =>
                statement.id === statementId
                    ? {
                          ...statement,
                          subtotal: formatStatementSubtotal(statement.subtotal)
                      }
                    : statement
            );
            const savedStatement = formattedRows.find((statement) => statement.id === statementId);

            if (savedStatement) {
                setSavedStatementRows((savedRows) =>
                    savedRows.map((statement) =>
                        statement.id === statementId
                            ? {
                                  ...savedStatement
                              }
                            : statement
                    )
                );
            }

            return formattedRows;
        });
    };

    return (
        <div className="reference-statements-panel">
            <div className="reference-statements-actions">
                <Button
                    variant="contained"
                    startIcon={<HelpOutlineIcon />}
                    sx={{
                        backgroundColor: '#3f3f43',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0,
                        '&:hover': { backgroundColor: '#2f2f32' }
                    }}
                >
                    PDF Guide
                </Button>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disabled
                    sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0
                    }}
                >
                    Statements
                </Button>
            </div>
            <div className="reference-table reference-statements-table" role="table" aria-label="Statements">
                <div className="reference-table-row reference-table-header statement-grid" role="row">
                    <div className="reference-table-cell statement-run-header" role="columnheader">
                        <Checkbox size="small" disabled />
                        <span>Statement run</span>
                        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#777' }} />
                    </div>
                    <div className="reference-table-cell statement-subtotal-header" role="columnheader">
                        <span>Subtotal</span>
                        <VisibilityIcon sx={{ fontSize: 16, color: '#777' }} />
                    </div>
                    <div className="reference-table-cell" role="columnheader">Recoupment</div>
                    <div className="reference-table-cell" role="columnheader" aria-label="Row actions" />
                    <div className="reference-table-cell" role="columnheader">Type</div>
                    <div className="reference-table-cell" role="columnheader">File name</div>
                </div>
                {statementRows.map((statement) => (
                    <React.Fragment key={statement.id}>
                        {(() => {
                            const savedStatement = savedStatementRows.find((item) => item.id === statement.id);
                            const isDirty =
                                savedStatement?.currency !== statement.currency ||
                                savedStatement?.subtotal !== statement.subtotal ||
                                savedStatement?.recoupmentState !== statement.recoupmentState;

                            return (
                                <div className="reference-table-row statement-grid statement-run-row" role="row">
                                    <div className="reference-table-cell statement-run-cell" role="cell">
                                        <button
                                            className="reference-icon-button"
                                            type="button"
                                            aria-label={`${statement.expanded ? 'Collapse' : 'Expand'} ${statement.period}`}
                                            onClick={() =>
                                                updateStatement(statement.id, {
                                                    expanded: !statement.expanded
                                                })
                                            }
                                        >
                                            {statement.expanded ? (
                                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                                            ) : (
                                                <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                                            )}
                                        </button>
                                        <Checkbox size="small" />
                                        <span>{statement.period}</span>
                                    </div>
                                    <div className="reference-table-cell statement-subtotal-cell" role="cell">
                                        <input
                                            aria-label={`${statement.period} subtotal`}
                                            className="reference-subtotal-input"
                                            value={formatStatementSubtotalInputValue(statement)}
                                            onChange={(event) =>
                                                updateStatement(
                                                    statement.id,
                                                    parseStatementSubtotalInputValue(
                                                        event.target.value,
                                                        statement.currency
                                                    )
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    saveStatement(statement.id);
                                                }
                                                if (event.key === 'Escape') {
                                                    rollbackStatement(statement.id);
                                                }
                                            }}
                                        />
                                        {statement.recoupmentState !== 'just-recouped' && (
                                            <span
                                                className="reference-recoupment-dot"
                                                aria-label={statement.recoupmentState}
                                            />
                                        )}
                                    </div>
                                    <div className="reference-table-cell statement-recoupment-cell" role="cell">
                                        <span className="reference-recoupment-control">
                                            <select
                                                aria-label={`${statement.period} recoupment state`}
                                                className="reference-recoupment-select"
                                                value={statement.recoupmentState}
                                                onChange={(event) =>
                                                    updateStatement(statement.id, {
                                                        recoupmentState: event.target.value as RecoupmentState
                                                    })
                                                }
                                            >
                                                {recoupmentOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#555' }} />
                                        </span>
                                    </div>
                                    <div className="reference-table-cell statement-row-actions" role="cell">
                                        {isDirty && (
                                            <>
                                                <button
                                                    className="reference-icon-button reference-row-rollback"
                                                    type="button"
                                                    aria-label={`Rollback ${statement.period} changes`}
                                                    onClick={() => rollbackStatement(statement.id)}
                                                >
                                                    <RestoreIcon sx={{ fontSize: 18 }} />
                                                </button>
                                                <button
                                                    className="reference-icon-button reference-row-save"
                                                    type="button"
                                                    aria-label={`Save ${statement.period} changes`}
                                                    onClick={() => saveStatement(statement.id)}
                                                >
                                                    <SaveOutlinedIcon sx={{ fontSize: 18 }} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="reference-table-cell" role="cell" />
                                    <div className="reference-table-cell" role="cell" />
                                </div>
                            );
                        })()}
                        {statement.expanded &&
                            statement.files.map((file) => (
                                <div key={file.id} className="reference-table-row statement-grid statement-file-row" role="row">
                                    <div className="reference-table-cell" role="cell" />
                                    <div className="reference-table-cell" role="cell" />
                                    <div className="reference-table-cell" role="cell" />
                                    <div className="reference-table-cell" role="cell" />
                                    <div className="reference-table-cell statement-file-type" role="cell">
                                        <Checkbox size="small" />
                                        <span>{file.type}</span>
                                    </div>
                                    <div className="reference-table-cell" role="cell">
                                        {file.fileName}
                                    </div>
                                </div>
                            ))}
                    </React.Fragment>
                ))}
                <div className="reference-statements-footer">
                    <span>Selected: (0)</span>
                    <span>Rows per page: 10</span>
                    <span>1-10 of {statementRows.length}</span>
                    <span>{'<'}</span>
                    <span>{'>'}</span>
                </div>
            </div>
        </div>
    );
}

function CmosTab({ registrations }: { registrations: CmoRegistration[] }): React.ReactElement {
    return (
        <div className="reference-content-panel">
            <div className="reference-toolbar">
                <span />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        backgroundColor: '#3f3f43',
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0,
                        '&:hover': { backgroundColor: '#2f2f32' }
                    }}
                >
                    Add CMO
                </Button>
            </div>
            <div className="reference-table" role="table" aria-label="CMOs">
                <div className="reference-table-row reference-table-header cmo-grid" role="row">
                    <div className="reference-table-cell" role="columnheader">
                        CMO
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Territories
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Start date
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        End date
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Status
                    </div>
                    <div className="reference-table-cell" role="columnheader">
                        Status date
                    </div>
                </div>
                {registrations.map((registration) => (
                    <div key={registration.cmo} className="reference-table-row cmo-grid" role="row">
                        <div className="reference-table-cell" role="cell">
                            {registration.cmo}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {registration.territories}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {registration.startDate}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {registration.endDate}
                        </div>
                        <div className="reference-table-cell" role="cell">
                            <span className="reference-status">{registration.status}</span>
                        </div>
                        <div className="reference-table-cell" role="cell">
                            {registration.statusDate}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface CurvePayloadField {
    id: string;
    field: string;
    nrValue: string;
    curveValue: string;
    sentValue: string;
    immutable?: boolean;
}

type SalesTermStatus = 'unchanged' | 'created' | 'updated';

type CurveSalesTermConfig = ReferenceCurveSalesTerm;

type EditableSalesTermField = Exclude<keyof CurveSalesTermConfig, 'id' | 'sourceDealId'>;

const emptyValue = 'Empty';
const payeeId = referenceCurveSyncData.contract.payeeId;
const priceCategoryOptions: CurveSalesTermPriceCategory[] = ['Performer', 'Rightsholder'];
const sourceOptions = [
    'ABRAMUS BR',
    'ACTRA RACS CA',
    'ADAMI FR',
    'AFM-AFTRA US',
    'AGATA LT',
    'AGEDI ES',
    'AIE ES',
    'APOLLON GR',
    'AUDIOGEST PT',
    'CONNECT CA',
    'CPRA JP',
    'CREDIDAM RO',
    'EFU EE',
    'EJI HU',
    'ERATO GR',
    'GDA PT',
    'GRAMEX DK',
    'GRAMEX FI',
    'GRAMMO GR',
    'GRAMO NO',
    'GVL DE',
    'HUZIP HR',
    'IFPI SE',
    'IMAGIA BE',
    'INTERGRAM CZ',
    'IPF ZAVOD SI',
    'ITSRIGHT IT',
    'LAIPA LV',
    'LSG AT',
    'MAHASZ HU',
    'MROC CA',
    'NORMA NL',
    'NUOVO IMAIE IT',
    'PIRS',
    'PLAYRIGHT BE',
    'PPCA AU',
    'PPL UK',
    'PROPHON BG',
    'RAAP IE',
    'RMNZ NZ',
    'SAMI SE',
    'SAMPRA ZA',
    'SCF IT',
    'SCPP FR',
    'SENA NL',
    'SIMIM BE',
    'SLOVGRAM SK',
    'SoundExchange US',
    'SPEDIDAM FR',
    'SPPF FR',
    'STOART PL',
    'SWISSPERFORM CH',
    'UMA UA',
    'ZAPRAF HR',
    'ZPAV PL',
    'KOBALT',
    'VPL UK',
    'PPNZ NZ',
    'PPI IE',
    'SENA',
    'PPNZ AU',
    'RIAJ JP',
    'KNR',
    'PI RS',
    'AFM SAGAFTRA US',
    'SOUNDEXCHANGE US',
    'ALL',
    'US sources',
    'UK Sources',
    'IE Sources',
    'AU/NZ Sources'
].sort((firstSource, secondSource) => firstSource.localeCompare(secondSource, undefined, { sensitivity: 'base' }));

const territorySourceOptions: Record<string, string[]> = {
    us: ['AFM-AFTRA US', 'AFM SAGAFTRA US', 'SoundExchange US', 'SOUNDEXCHANGE US', 'US sources']
};

const currentCurveSalesTerms = referenceCurveSyncData.salesTerms;

const toCurveRate = (rate: string): string => {
    const numericRate = parseRateValue(rate);

    if (!numericRate && !rate.trim().startsWith('0')) {
        return rate;
    }

    return `${100 - numericRate}%`;
};

const parseMoneyValue = (value: string): number => {
    const numericValue = Number(value.replace(/[€, $]/g, '').replace(/,/g, '').trim());

    return Number.isFinite(numericValue) ? numericValue : 0;
};

const parseRateValue = (value: string): number => {
    const numericValue = Number(value.replace('%', '').replace(',', '.').trim());

    return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatMoneyLabel = (value: string): string => {
    const numericValue = parseMoneyValue(value);

    if (!numericValue) {
        return value;
    }

    return `€${new Intl.NumberFormat('en-US').format(numericValue)}`;
};

const getEffectiveDealRate = (deal: TerritoryDeal, accountBalance: string): string => {
    if (deal.rateType !== 'sliding' || !deal.slidingScale?.length) {
        return deal.rate;
    }

    const balance = parseMoneyValue(accountBalance);
    const numericTier = deal.slidingScale.find((tier) => {
        const tierLimit = parseMoneyValue(tier.to);

        return tier.to !== 'above' && balance <= tierLimit;
    });
    const aboveTier = deal.slidingScale.find((tier) => tier.to === 'above');

    return numericTier?.rate ?? aboveTier?.rate ?? deal.rate;
};

const getDealRateLabel = (
    deal: TerritoryDeal,
    accountBalance: string,
    options?: { showCurrentBadge?: boolean }
): React.ReactNode => {
    if (deal.rateType !== 'sliding' || !deal.slidingScale?.length) {
        return deal.rate;
    }

    const balance = parseMoneyValue(accountBalance);
    let activeIdx = deal.slidingScale.findIndex(
        (tier) => tier.to !== 'above' && balance <= parseMoneyValue(tier.to)
    );
    if (activeIdx === -1) {
        activeIdx = deal.slidingScale.findIndex((tier) => tier.to === 'above');
    }

    const elements: React.ReactNode[] = [];
    let lastThreshold: string | null = null;
    deal.slidingScale.forEach((tier, i) => {
        let text: string;
        if (tier.to === 'above') {
            text = lastThreshold ? `> ${lastThreshold} (${tier.rate})` : `(${tier.rate})`;
        } else {
            const formatted = formatMoneyLabel(tier.to);
            text = `< ${formatted} (${tier.rate})`;
            lastThreshold = formatted;
        }
        if (i > 0) {
            elements.push(<span key={`${tier.id}-sep`}>; </span>);
        }
        elements.push(
            <span key={tier.id} className={i === activeIdx ? 'reference-rate-tier-active' : undefined}>
                {text}
            </span>
        );
        if (i === activeIdx && options?.showCurrentBadge) {
            elements.push(
                <span key={`${tier.id}-current`} className="reference-sync-deal-card-current">
                    <CheckIcon sx={{ fontSize: 14 }} /> Current
                </span>
            );
        }
    });
    return elements;
};

const isEmptyPayloadValue = (value: string): boolean => value === 'Empty' || value === 'Not set';

const shouldHighlightPayloadChange = (curveValue: string, sentValue: string): boolean => {
    if (curveValue === sentValue) {
        return false;
    }

    return !(isEmptyPayloadValue(curveValue) && isEmptyPayloadValue(sentValue));
};

const normalizeTerritory = (territory: string): string =>
    territory.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();

const isWorldTerritory = (territory: string): boolean => {
    const normalizedTerritory = normalizeTerritory(territory);

    return (
        !normalizedTerritory.includes('excluding') &&
        (normalizedTerritory === 'ww' || normalizedTerritory === 'world' || normalizedTerritory === 'worldwide')
    );
};

const isWorldExcludingUsTerritory = (territory: string): boolean => {
    const normalizedTerritory = normalizeTerritory(territory);

    return (
        (normalizedTerritory.includes('ww') ||
            normalizedTerritory.includes('world') ||
            normalizedTerritory.includes('worldwide')) &&
        normalizedTerritory.includes('excluding') &&
        (normalizedTerritory.includes('us') || normalizedTerritory.includes('united states'))
    );
};

const isUnitedStatesTerritory = (territory: string): boolean => {
    const normalizedTerritory = normalizeTerritory(territory);

    return normalizedTerritory === 'us' || normalizedTerritory === 'usa' || normalizedTerritory === 'united states';
};

const doTerritoriesConflict = (firstTerritory: string, secondTerritory: string): boolean => {
    if (isWorldTerritory(firstTerritory) || isWorldTerritory(secondTerritory)) {
        return true;
    }

    if (isWorldExcludingUsTerritory(firstTerritory)) {
        return !isUnitedStatesTerritory(secondTerritory);
    }

    if (isWorldExcludingUsTerritory(secondTerritory)) {
        return !isUnitedStatesTerritory(firstTerritory);
    }

    return normalizeTerritory(firstTerritory) === normalizeTerritory(secondTerritory);
};

const hasSelectedTerritoryConflict = (
    deal: TerritoryDeal,
    selectedDealIds: string[],
    deals: TerritoryDeal[]
): boolean =>
    deals.some(
        (selectedDeal) =>
            selectedDealIds.includes(selectedDeal.id) &&
            selectedDeal.id !== deal.id &&
            doTerritoriesConflict(deal.territories, selectedDeal.territories)
    );

const getDefaultSelectedDealIds = (deals: TerritoryDeal[]): string[] => {
    const worldDeal = deals.find((deal) => isWorldTerritory(deal.territories));

    if (worldDeal) {
        return [worldDeal.id];
    }

    return deals.reduce<string[]>((selectedDealIds, deal) => {
        if (hasSelectedTerritoryConflict(deal, selectedDealIds, deals)) {
            return selectedDealIds;
        }

        return [...selectedDealIds, deal.id];
    }, []);
};

const getAggregateDealSyncState = (
    deals: TerritoryDeal[],
    dealSyncStates: Record<string, SyncState>
): SyncState => {
    const states = deals.map((deal) => dealSyncStates[deal.id] ?? deal.syncState);

    if (states.includes('requires-sync')) {
        return 'requires-sync';
    }

    if (states.includes('not-synced')) {
        return 'not-synced';
    }

    return 'synced';
};

const buildPayeePayload = (client: RightsHolderClient): CurvePayloadField[] => [
    {
        id: 'payee-foreign-id',
        field: 'foreignId',
        nrValue: client.details.nrpClientId,
        curveValue: referenceCurveSyncData.payee.foreignId,
        sentValue: client.details.nrpClientId,
        immutable: true
    },
    {
        id: 'payee-name',
        field: 'name',
        nrValue: client.clientName,
        curveValue: referenceCurveSyncData.payee.name,
        sentValue: client.clientName
    },
    {
        id: 'payee-alternate-name',
        field: 'alternateName',
        nrValue: client.details.royaltiesClientName,
        curveValue: referenceCurveSyncData.payee.alternateName,
        sentValue: client.details.royaltiesClientName
    },
    {
        id: 'payee-country',
        field: 'country',
        nrValue: client.details.bankCountry || 'Not set',
        curveValue: referenceCurveSyncData.payee.country,
        sentValue: client.details.bankCountry || emptyValue
    },
    {
        id: 'payee-address',
        field: 'address',
        nrValue: client.details.businessRegisteredAddress || 'Not set',
        curveValue: referenceCurveSyncData.payee.address,
        sentValue: client.details.businessRegisteredAddress || emptyValue
    },
    {
        id: 'payee-contact-email',
        field: 'contactEmail',
        nrValue: client.details.businessMailingAddress || 'Not set',
        curveValue: referenceCurveSyncData.payee.contactEmail,
        sentValue: client.details.businessMailingAddress || emptyValue
    },
    {
        id: 'payee-categories',
        field: 'payeeCategories',
        nrValue: 'Rights Holder',
        curveValue: referenceCurveSyncData.payee.payeeCategories,
        sentValue: 'Rights Holder',
        immutable: true
    }
];

const createSalesTermConfig = ({
    deal,
    id,
    priceCategory,
    rate,
    source = 'ALL',
    territory = 'All'
}: {
    deal: TerritoryDeal;
    id: string;
    priceCategory: CurveSalesTermPriceCategory;
    rate: string;
    source?: string;
    territory?: string;
}): CurveSalesTermConfig => ({
    id,
    sourceDealId: deal.id,
    catType: 'All',
    catalogueGroup: 'All',
    territory,
    channel: 'All',
    configuration: 'All',
    priceCategory,
    source,
    type: 'Net Receipts',
    rate,
    multiplier: '',
    reductionRate: '',
    reserve: ''
});

const getTerritorySpecificSources = (territory: string): string[] => {
    if (isUnitedStatesTerritory(territory)) {
        return territorySourceOptions.us.filter(
            (source, index, sources) =>
                index ===
                sources.findIndex(
                    (candidateSource) =>
                        candidateSource.toLowerCase().trim() === source.toLowerCase().trim()
                )
        );
    }

    return [];
};

const buildDefaultSalesTerms = (client: RightsHolderClient): CurveSalesTermConfig[] => {
    const broadDeal =
        client.territoryDeals.find((deal) => isWorldTerritory(deal.territories) || isWorldExcludingUsTerritory(deal.territories)) ??
        client.territoryDeals[0];

    if (!broadDeal) {
        return [];
    }

    const globalTerms: CurveSalesTermConfig[] = [
        createSalesTermConfig({
            deal: broadDeal,
            id: 'global-performer-default',
            priceCategory: 'Performer',
            rate: '0%'
        }),
        createSalesTermConfig({
            deal: broadDeal,
            id: 'global-rightsholder-default',
            priceCategory: 'Rightsholder',
            rate: toCurveRate(getEffectiveDealRate(broadDeal, client.details.accountBalance))
        })
    ];

    const territorySpecificTerms = client.territoryDeals.flatMap((deal) =>
        getTerritorySpecificSources(deal.territories).map((source) =>
            createSalesTermConfig({
                deal,
                id: `${deal.id}-${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                priceCategory: 'Rightsholder',
                source,
                territory: deal.territories,
                rate: toCurveRate(getEffectiveDealRate(deal, client.details.accountBalance))
            })
        )
    );

    return [...globalTerms, ...territorySpecificTerms];
};

const refreshDefaultSalesTermRates = (
    client: RightsHolderClient,
    salesTerms: CurveSalesTermConfig[]
): CurveSalesTermConfig[] =>
    salesTerms.map((salesTerm) => {
        const deal = client.territoryDeals.find((item) => item.id === salesTerm.sourceDealId);
        const isAutoManagedGlobalRightsholder = salesTerm.id === 'global-rightsholder-default';
        const isAutoManagedTerritorySpecific =
            salesTerm.priceCategory === 'Rightsholder' &&
            salesTerm.source !== 'ALL' &&
            getTerritorySpecificSources(salesTerm.territory).includes(salesTerm.source);

        if (!deal || (!isAutoManagedGlobalRightsholder && !isAutoManagedTerritorySpecific)) {
            return salesTerm;
        }

        return {
            ...salesTerm,
            rate: toCurveRate(getEffectiveDealRate(deal, client.details.accountBalance))
        };
    });

const getSalesTermComparisonKey = (salesTerm: CurveSalesTermConfig): string =>
    [salesTerm.priceCategory, salesTerm.source, salesTerm.territory]
        .map((value) => value.toLowerCase().trim())
        .join('|');

const getSalesTermComparableValues = (salesTerm: CurveSalesTermConfig): string[] => [
    salesTerm.catType,
    salesTerm.catalogueGroup,
    salesTerm.territory,
    salesTerm.channel,
    salesTerm.configuration,
    salesTerm.priceCategory,
    salesTerm.source,
    salesTerm.type,
    salesTerm.rate,
    salesTerm.multiplier,
    salesTerm.reductionRate,
    salesTerm.reserve
];

const getMatchingCurveSalesTerm = (salesTerm: CurveSalesTermConfig): CurveSalesTermConfig | undefined =>
    currentCurveSalesTerms.find((item) => getSalesTermComparisonKey(item) === getSalesTermComparisonKey(salesTerm));

const getSalesTermStatus = (salesTerm: CurveSalesTermConfig): SalesTermStatus => {
    const curveSalesTerm = getMatchingCurveSalesTerm(salesTerm);

    if (!curveSalesTerm) {
        return 'created';
    }

    return getSalesTermComparableValues(curveSalesTerm).every(
        (value, index) => value === getSalesTermComparableValues(salesTerm)[index]
    )
        ? 'unchanged'
        : 'updated';
};

const getSalesTermFieldValue = (salesTerm: CurveSalesTermConfig, field: EditableSalesTermField): string =>
    salesTerm[field];

const isSalesTermFieldChanged = (salesTerm: CurveSalesTermConfig, field: EditableSalesTermField): boolean => {
    const curveSalesTerm = getMatchingCurveSalesTerm(salesTerm);
    const sentValue = getSalesTermFieldValue(salesTerm, field) || emptyValue;
    const curveValue = curveSalesTerm ? getSalesTermFieldValue(curveSalesTerm, field) || emptyValue : 'Not set';

    return shouldHighlightPayloadChange(curveValue, sentValue);
};

const buildContractPayload = (client: RightsHolderClient): CurvePayloadField[] => {
    const contractName = `${client.clientName} Neighbouring Rights`;

    return [
        {
            id: 'contract-name',
            field: 'name',
            nrValue: contractName,
            curveValue: referenceCurveSyncData.contract.name,
            sentValue: contractName
        },
        {
            id: 'contract-currency',
            field: 'currency',
            nrValue: client.details.currency,
            curveValue: referenceCurveSyncData.contract.currency,
            sentValue: client.details.currency
        }
    ];
};

function PayloadTable({ rows }: { rows: CurvePayloadField[] }): React.ReactElement {
    return (
        <div className="reference-payload-table" role="table">
            <div className="reference-payload-row header" role="row">
                <div role="columnheader">Field</div>
                <div role="columnheader">Curve</div>
                <div role="columnheader">NR</div>
            </div>
            {rows.map((row) => {
                const isChanged = !row.immutable && shouldHighlightPayloadChange(row.curveValue, row.nrValue);

                return (
                    <div
                        key={row.id}
                        className={`reference-payload-row${isChanged ? ' changed' : ''}${
                            row.immutable ? ' immutable' : ''
                        }`}
                        role="row"
                    >
                        <div role="cell">{row.field}</div>
                        <div role="cell" className={isChanged ? 'reference-before-value' : undefined}>
                            {row.curveValue}
                        </div>
                        <div role="cell" className={isChanged ? 'reference-after-value' : undefined}>
                            {row.nrValue}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SalesTermsEditor({
    salesTerms,
    onAddSalesTerm,
    onDeleteSalesTerm,
    onUpdateSalesTerm,
    title
}: {
    salesTerms: CurveSalesTermConfig[];
    onAddSalesTerm: () => void;
    onDeleteSalesTerm: (_salesTermId: string) => void;
    onUpdateSalesTerm: (_salesTermId: string, _field: EditableSalesTermField, _value: string) => void;
    title?: string;
}): React.ReactElement {
    const renderInput = (
        salesTerm: CurveSalesTermConfig,
        field: EditableSalesTermField,
        label: string
    ): React.ReactElement => (
        <input
            aria-label={`${label} ${salesTerm.id}`}
            className={`reference-sales-term-input${isSalesTermFieldChanged(salesTerm, field) ? ' changed' : ''}`}
            value={salesTerm[field]}
            onChange={(event) => onUpdateSalesTerm(salesTerm.id, field, event.target.value)}
        />
    );

    return (
        <>
            <div className="reference-sales-terms-toolbar">
                {title && <h5 className="reference-sales-terms-title">{title}</h5>}
                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<AddIcon />}
                    onClick={onAddSalesTerm}
                    sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 0,
                        minHeight: 32,
                        color: 'var(--nr-text-primary)',
                        '& .MuiSvgIcon-root': { color: 'var(--nr-text-primary)' }
                    }}
                >
                    Add sales term
                </Button>
            </div>
            <div className="reference-sales-terms-table" role="table" aria-label="Sales terms payload">
                <div className="reference-sales-terms-row header" role="row">
                    <div role="columnheader">State</div>
                    <div role="columnheader">Price cat</div>
                    <div role="columnheader">Source</div>
                    <div role="columnheader">Rate %</div>
                    <div role="columnheader" aria-label="Sales term actions" />
                </div>
                {salesTerms.map((salesTerm) => {
                    const status = getSalesTermStatus(salesTerm);

                    return (
                        <div
                            key={salesTerm.id}
                            className={`reference-sales-terms-row editable ${status}`}
                            role="row"
                        >
                            <div role="cell">
                                <span className={`reference-sales-term-status ${status}`}>
                                    {status.replace('-', ' ')}
                                </span>
                            </div>
                            <div role="cell">
                                <select
                                    aria-label={`Price category ${salesTerm.id}`}
                                    className={`reference-sales-term-select${
                                        isSalesTermFieldChanged(salesTerm, 'priceCategory') ? ' changed' : ''
                                    }`}
                                    value={salesTerm.priceCategory}
                                    onChange={(event) =>
                                        onUpdateSalesTerm(
                                            salesTerm.id,
                                            'priceCategory',
                                            event.target.value as CurveSalesTermPriceCategory
                                        )
                                    }
                                >
                                    {priceCategoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div role="cell">
                                <select
                                    aria-label={`Source ${salesTerm.id}`}
                                    className={`reference-sales-term-select${
                                        isSalesTermFieldChanged(salesTerm, 'source') ? ' changed' : ''
                                    }`}
                                    value={salesTerm.source}
                                    onChange={(event) => onUpdateSalesTerm(salesTerm.id, 'source', event.target.value)}
                                >
                                    {sourceOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div role="cell">{renderInput(salesTerm, 'rate', 'Rate')}</div>
                            <div role="cell">
                                <button
                                    aria-label={`Delete sales term ${salesTerm.id}`}
                                    className="reference-icon-button reference-sales-term-delete"
                                    type="button"
                                    onClick={() => onDeleteSalesTerm(salesTerm.id)}
                                >
                                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function TerritoryDealDialog({
    accountBalance,
    deal,
    open,
    onClose,
    onSave,
    onUpdateDeal
}: {
    accountBalance: string;
    deal: TerritoryDeal | null;
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    onUpdateDeal: (_deal: TerritoryDeal) => void;
}): React.ReactElement {
    if (!deal) {
        return <></>;
    }

    const updateDealField = (field: 'rate' | 'rateType', value: string): void => {
        onUpdateDeal({
            ...deal,
            [field]: value
        });
    };
    const updateTier = (tierId: string, field: 'rate' | 'to', value: string): void => {
        onUpdateDeal({
            ...deal,
            slidingScale: (deal.slidingScale ?? []).map((tier) =>
                tier.id === tierId
                    ? {
                          ...tier,
                          [field]: value
                      }
                    : tier
            )
        });
    };
    const effectiveRate = getEffectiveDealRate(deal, accountBalance);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{ className: 'reference-deal-dialog-paper' }}
        >
            <DialogTitle>Edit Deal terms</DialogTitle>
            <DialogContent>
                <div className="reference-deal-modal">
                    <section>
                        <h3>Claim methods</h3>
                        <div className="reference-rate-mode">
                            <label>
                                <input checked readOnly name="claim-method" type="radio" />
                                Agent
                            </label>
                            <label className="muted">
                                <input disabled name="claim-method" type="radio" />
                                Exclusive license
                            </label>
                        </div>
                    </section>
                    <section>
                        <h3>Contract duration</h3>
                        <div className="reference-deal-modal-grid">
                            <label>
                                <span>Start Date</span>
                                <input aria-label="Deal start date" readOnly value={deal.startDate} />
                            </label>
                            <label>
                                <span>End Date</span>
                                <input aria-label="Deal end date" readOnly value={deal.endDate} />
                            </label>
                        </div>
                    </section>
                    <section>
                        <h3>Territories</h3>
                        <div className="reference-territory-picker" aria-label="Territory groups">
                            {(() => {
                                const isWorldExcludingUs = deal.territories === 'World excluding US';
                                const isUsOnly = deal.territories === 'US';
                                const territoryRows: Array<{ name: string; items: number }> = [
                                    { name: 'World', items: 249 },
                                    { name: 'Americas', items: 55 },
                                    { name: 'Oceania', items: 34 },
                                    { name: 'Africa', items: 58 },
                                    { name: 'Europe', items: 52 },
                                    { name: 'Asia', items: 50 }
                                ];
                                return territoryRows.map(({ name, items }) => {
                                    const isAmericas = name === 'Americas';
                                    const indeterminate = isAmericas && (isWorldExcludingUs || isUsOnly);
                                    const checked = !isAmericas && isWorldExcludingUs;
                                    const selectedCount = checked ? items : indeterminate ? items - 1 : 0;
                                    const status = `${items} items, ${selectedCount} available, ${selectedCount} selected`;
                                    return (
                                        <label
                                            key={name}
                                            className={`reference-territory-picker-row${
                                                checked || indeterminate ? ' selected' : ''
                                            }`}
                                        >
                                            <Checkbox
                                                size="small"
                                                checked={checked}
                                                indeterminate={indeterminate}
                                                readOnly
                                            />
                                            <strong>{name}</strong>
                                            <span>{`(${status})`}</span>
                                            <KeyboardArrowDownIcon sx={{ marginLeft: 'auto', fontSize: 18 }} />
                                        </label>
                                    );
                                });
                            })()}
                        </div>
                    </section>
                    <section>
                        <h3>Rates</h3>
                        <div className="reference-rate-mode">
                            <label>
                                <input
                                    checked={deal.rateType === 'flat'}
                                    name="rate-type"
                                    type="radio"
                                    onChange={() => updateDealField('rateType', 'flat')}
                                />
                                Flat
                            </label>
                            <label>
                                <input
                                    checked={deal.rateType === 'sliding'}
                                    name="rate-type"
                                    type="radio"
                                    onChange={() => updateDealField('rateType', 'sliding')}
                                />
                                Sliding
                            </label>
                        </div>
                        {deal.rateType === 'flat' ? (
                            <label className="reference-deal-modal-rate">
                                <span>Rate</span>
                                <input
                                    aria-label="Deal flat rate"
                                    value={deal.rate}
                                    onChange={(event) => updateDealField('rate', event.target.value)}
                                />
                            </label>
                        ) : (
                            <div className="reference-sliding-scale">
                                {(deal.slidingScale ?? []).map((tier, index) => (
                                    <div key={tier.id} className="reference-sliding-scale-row">
                                        {index === 0 ? (
                                            <label>
                                                <span>To</span>
                                                <span className="reference-affixed-input">
                                                    <span>€</span>
                                                    <input
                                                        aria-label="Sliding scale threshold"
                                                        value={tier.to}
                                                        onChange={(event) =>
                                                            updateTier(tier.id, 'to', event.target.value)
                                                        }
                                                    />
                                                </span>
                                            </label>
                                        ) : (
                                            <div className="reference-sliding-above">
                                                <span>&gt; above</span>
                                            </div>
                                        )}
                                        <label>
                                            <span>Rate</span>
                                            <span className="reference-affixed-input">
                                                <input
                                                    aria-label={`Sliding scale rate ${index + 1}`}
                                                    value={tier.rate.replace('%', '')}
                                                    onChange={(event) =>
                                                        updateTier(tier.id, 'rate', `${event.target.value.replace('%', '')}%`)
                                                    }
                                                />
                                                <span>%</span>
                                            </span>
                                        </label>
                                        <p>
                                            {tier.to === 'above'
                                                ? `${tier.rate} commission for revenue above ${
                                                      formatMoneyLabel(deal.slidingScale?.[0]?.to || '0')
                                                  }`
                                                : `${tier.rate} commission for revenue up to ${formatMoneyLabel(tier.to)}`}
                                        </p>
                                    </div>
                                ))}
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={(event) => event.preventDefault()}
                                    sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0, width: 'fit-content' }}
                                >
                                    Add another tier
                                </Button>
                                <p className="reference-helper-text reference-deal-modal-helper">
                                    Account balance {accountBalance || '0'} gives effective NR rate {effectiveRate}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={onSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function CurveSyncDialog({
    client,
    dealSyncStates,
    open,
    selectedScopes,
    selectedDealIds,
    salesTerms,
    onClose,
    onAddSalesTerm,
    onDeleteSalesTerm,
    onToggleScope,
    onToggleDeal,
    onUpdateSalesTerm,
    onSync
}: {
    client: RightsHolderClient;
    dealSyncStates: Record<string, SyncState>;
    open: boolean;
    selectedScopes: CurveSyncScope[];
    selectedDealIds: string[];
    salesTerms: CurveSalesTermConfig[];
    onClose: () => void;
    onAddSalesTerm: () => void;
    onDeleteSalesTerm: (_salesTermId: string) => void;
    onToggleScope: (_scope: CurveSyncScope) => void;
    onToggleDeal: (_dealId: string) => void;
    onUpdateSalesTerm: (_salesTermId: string, _field: EditableSalesTermField, _value: string) => void;
    onSync: () => void;
}): React.ReactElement {
    const [activeScopeTab, setActiveScopeTab] = useState<CurveSyncScope>('client');
    const payeePayload = buildPayeePayload(client);
    const contractPayload = buildContractPayload(client);
    const hasSelectedScope = selectedScopes.length > 0 && (!selectedScopes.includes('deals') || selectedDealIds.length > 0);
    const isDealDisabled = (deal: TerritoryDeal): boolean =>
        !selectedDealIds.includes(deal.id) && hasSelectedTerritoryConflict(deal, selectedDealIds, client.territoryDeals);

    const renderScopeTabLabel = (label: string): React.ReactNode => (
        <span className="reference-sync-scope-tab-label">{label}</span>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Sync with Curve</DialogTitle>
            <DialogContent>
                <div className="reference-sync-modal">
                    <Tabs
                        className="reference-sync-scope-tabs"
                        value={activeScopeTab}
                        onChange={(_event, value: CurveSyncScope) => setActiveScopeTab(value)}
                        textColor="inherit"
                        indicatorColor="primary"
                    >
                        <Tab value="client" label={renderScopeTabLabel('CLIENT DATA')} />
                        <Tab value="deals" label={renderScopeTabLabel('TERRITORY DEALS')} />
                    </Tabs>

                    {activeScopeTab === 'client' && selectedScopes.includes('client') && (
                        <div className="reference-sync-nested-card" aria-label="Client NRP overwrites">
                            <h4>NRP overwrites</h4>
                            <PayloadTable rows={payeePayload} />
                        </div>
                    )}

                    {activeScopeTab === 'deals' && selectedScopes.includes('deals') && (
                        <div className="reference-sync-tab-stack">
                            <div className="reference-sync-nested-card" aria-label="Territory deal NRP overwrites">
                                <h4>NRP overwrites</h4>
                                <PayloadTable rows={contractPayload} />
                            </div>

                            {client.territoryDeals.map((deal) => {
                                const isSelected = selectedDealIds.includes(deal.id);
                                const disabled = isDealDisabled(deal);
                                const dealSalesTerms = salesTerms.filter(
                                    (term) => term.sourceDealId === deal.id
                                );
                                return (
                                    <div
                                        key={deal.id}
                                        className={`reference-sync-deal-card${
                                            isSelected ? ' selected' : ''
                                        }${disabled ? ' disabled' : ''}`}
                                    >
                                        <label
                                            className="reference-sync-deal-card-header"
                                            title={
                                                disabled
                                                    ? 'Territory already covered by selected deal'
                                                    : undefined
                                            }
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                disabled={disabled}
                                                onChange={() => onToggleDeal(deal.id)}
                                            />
                                            <strong>{deal.territories}</strong>
                                        </label>
                                        <div className="reference-sync-deal-card-meta">
                                            <span>
                                                <strong>Start:</strong> {deal.startDate}{' '}
                                                <strong>End:</strong> {deal.endDate}
                                            </span>
                                            <span>
                                                <strong>Rate:</strong>{' '}
                                                {getDealRateLabel(deal, client.details.accountBalance, {
                                                    showCurrentBadge: true
                                                })}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="reference-sync-deal-card-sales-terms">
                                                <SalesTermsEditor
                                                    title="Curve Sales Terms overwrites"
                                                    salesTerms={dealSalesTerms}
                                                    onAddSalesTerm={onAddSalesTerm}
                                                    onDeleteSalesTerm={onDeleteSalesTerm}
                                                    onUpdateSalesTerm={onUpdateSalesTerm}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!hasSelectedScope} onClick={onSync}>
                    Sync selected
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ReferenceClientPage(): React.ReactElement {
    const { id } = useParams<{ id?: string }>();
    const [tab, setTab] = useState<ClientTab>('main');
    const client = useMemo(() => getReferenceRightsHolderById(id), [id]);
    const [savedClient, setSavedClient] = useState<RightsHolderClient>(() => cloneRightsHolderClient(client));
    const [draftClient, setDraftClient] = useState<RightsHolderClient>(() => cloneRightsHolderClient(client));
    const [isEditingMainDetails, setIsEditingMainDetails] = useState(false);
    const [syncStateBeforeEdit, setSyncStateBeforeEdit] = useState<SyncState>(client.syncState);
    const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
    const [selectedSyncScopes, setSelectedSyncScopes] = useState<CurveSyncScope[]>(['client', 'deals']);
    const [selectedDealIds, setSelectedDealIds] = useState<string[]>(() =>
        getDefaultSelectedDealIds(client.territoryDeals)
    );
    const [clientSyncState, setClientSyncState] = useState<SyncState>(client.syncState);
    const [dealSyncStates, setDealSyncStates] = useState<Record<string, SyncState>>(() =>
        Object.fromEntries(client.territoryDeals.map((deal) => [deal.id, deal.syncState]))
    );
    const [salesTermConfigs, setSalesTermConfigs] = useState<CurveSalesTermConfig[]>(() =>
        buildDefaultSalesTerms(client)
    );
    const [editingDeal, setEditingDeal] = useState<TerritoryDeal | null>(null);
    const tabIndex = tabByIndex.indexOf(tab);

    useEffect(() => {
        const nextClient = cloneRightsHolderClient(client);
        setSavedClient(nextClient);
        setDraftClient(cloneRightsHolderClient(client));
        setIsEditingMainDetails(false);
        setClientSyncState(client.syncState);
        setSyncStateBeforeEdit(client.syncState);
        setDealSyncStates(Object.fromEntries(client.territoryDeals.map((deal) => [deal.id, deal.syncState])));
        setSalesTermConfigs(buildDefaultSalesTerms(client));
        setSelectedSyncScopes(['client', 'deals']);
        setSelectedDealIds(getDefaultSelectedDealIds(client.territoryDeals));
        setIsSyncDialogOpen(false);
        setEditingDeal(null);
    }, [client]);

    const markClientAsRequiringSync = (): void => {
        setClientSyncState('requires-sync');
    };

    const updateDraftClientField = (field: 'clientName' | 'dealStartDate' | 'tier', value: string): void => {
        setDraftClient((currentClient) => ({
            ...currentClient,
            [field]: value
        }));
        markClientAsRequiringSync();
    };

    const updateDraftDetailField = (field: keyof RightsHolderClientDetails, value: string): void => {
        setDraftClient((currentClient) => ({
            ...currentClient,
            details: {
                ...currentClient.details,
                [field]: value
            }
        }));
        markClientAsRequiringSync();
    };

    const startMainDetailsEdit = (): void => {
        setDraftClient(cloneRightsHolderClient(savedClient));
        setSyncStateBeforeEdit(clientSyncState);
        setIsEditingMainDetails(true);
    };

    const cancelMainDetailsEdit = (): void => {
        setDraftClient(cloneRightsHolderClient(savedClient));
        setClientSyncState(syncStateBeforeEdit);
        setIsEditingMainDetails(false);
    };

    const saveMainDetailsEdit = (): void => {
        const nextSavedClient = cloneRightsHolderClient(draftClient);
        setSavedClient(nextSavedClient);
        setDraftClient(cloneRightsHolderClient(nextSavedClient));
        setClientSyncState('requires-sync');
        setSyncStateBeforeEdit('requires-sync');
        setIsEditingMainDetails(false);
    };

    const openSyncDialog = (
        scopes: CurveSyncScope[],
        dealIds = getDefaultSelectedDealIds(draftClient.territoryDeals)
    ): void => {
        setSalesTermConfigs((salesTerms) => refreshDefaultSalesTermRates(draftClient, salesTerms));
        setSelectedSyncScopes(scopes);
        setSelectedDealIds(dealIds);
        setIsSyncDialogOpen(true);
    };

    const toggleSyncScope = (scope: CurveSyncScope): void => {
        setSelectedSyncScopes((scopes) =>
            scopes.includes(scope) ? scopes.filter((item) => item !== scope) : [...scopes, scope]
        );
    };

    const toggleSelectedDeal = (dealId: string): void => {
        setSelectedDealIds((dealIds) =>
            dealIds.includes(dealId)
                ? dealIds.filter((item) => item !== dealId)
                : draftClient.territoryDeals.some(
                      (deal) =>
                          deal.id === dealId &&
                          hasSelectedTerritoryConflict(deal, dealIds, draftClient.territoryDeals)
                  )
                  ? dealIds
                  : [...dealIds, dealId]
        );
    };

    const addSalesTerm = (): void => {
        const deal = draftClient.territoryDeals.find((item) => item.id === selectedDealIds[0]);

        if (!deal) {
            return;
        }

        setSalesTermConfigs((salesTerms) => [
            ...salesTerms,
            createSalesTermConfig({
                deal,
                id: `${deal.id}-custom-${salesTerms.length + 1}-${Date.now()}`,
                priceCategory: 'Rightsholder',
                rate: toCurveRate(getEffectiveDealRate(deal, draftClient.details.accountBalance))
            })
        ]);
    };

    const deleteSalesTerm = (salesTermId: string): void => {
        setSalesTermConfigs((salesTerms) => salesTerms.filter((salesTerm) => salesTerm.id !== salesTermId));
    };

    const updateSalesTerm = (salesTermId: string, field: EditableSalesTermField, value: string): void => {
        setSalesTermConfigs((salesTerms) =>
            salesTerms.map((salesTerm) =>
                salesTerm.id === salesTermId
                    ? {
                          ...salesTerm,
                          [field]: value
                      }
                    : salesTerm
            )
        );
    };

    const openDealEditor = (deal: TerritoryDeal): void => {
        setEditingDeal({
            ...deal,
            slidingScale: deal.slidingScale?.map((tier) => ({ ...tier }))
        });
    };

    const saveEditedDeal = (): void => {
        if (!editingDeal) {
            return;
        }

        const updateClientDeal = (currentClient: RightsHolderClient): RightsHolderClient => ({
            ...currentClient,
            territoryDeals: currentClient.territoryDeals.map((deal) =>
                deal.id === editingDeal.id
                    ? {
                          ...editingDeal
                      }
                    : deal
            )
        });

        setDraftClient(updateClientDeal);
        setSavedClient(updateClientDeal);
        setDealSyncStates((states) => ({
            ...states,
            [editingDeal.id]: 'requires-sync'
        }));
        setSalesTermConfigs((salesTerms) =>
            refreshDefaultSalesTermRates(updateClientDeal(draftClient), salesTerms)
        );
        setEditingDeal(null);
    };

    const syncSelectedItems = (): void => {
        if (selectedSyncScopes.includes('client')) {
            setClientSyncState('synced');
            setSyncStateBeforeEdit('synced');
        }

        if (selectedSyncScopes.includes('deals')) {
            setDealSyncStates((states) => ({
                ...states,
                ...Object.fromEntries(selectedDealIds.map((dealId) => [dealId, 'synced' as SyncState]))
            }));
        }

        setIsSyncDialogOpen(false);
    };

    return (
        <section className="reference-page reference-detail-page">
            <div className="reference-breadcrumbs">
                <Link to="/rights-holders">Clients</Link>
                <span>/</span>
                <Link to="/rights-holders">Rights Holders</Link>
                <span>/</span>
                <strong>{draftClient.clientName}</strong>
            </div>

            <div className="reference-title-row">
                <div className="reference-title-with-sync">
                    <h1 className="reference-page-title">{draftClient.clientName}</h1>
                    <SyncStateIndicator
                        state={clientSyncState}
                        showLabel
                        subject="Client"
                        ariaLabel={`Sync ${draftClient.clientName} client with Curve`}
                        onClick={() => openSyncDialog(['client'], [])}
                    />
                </div>
                {tab === 'main' && (
                    <div className="reference-actions compact">
                        {isEditingMainDetails ? (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={cancelMainDetailsEdit}
                                    sx={{ fontSize: 12, fontWeight: 700, minHeight: 34, letterSpacing: 0 }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={saveMainDetailsEdit}
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
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={<SyncIcon />}
                                    onClick={() => openSyncDialog(['client', 'deals'])}
                                    sx={{
                                        backgroundColor: '#3f3f43',
                                        color: '#ffffff',
                                        fontSize: 12,
                                        fontWeight: 800,
                                        minHeight: 34,
                                        letterSpacing: 0,
                                        '&:hover': {
                                            backgroundColor: '#2f2f32'
                                        },
                                        '& .MuiSvgIcon-root': { color: '#ffffff' }
                                    }}
                                >
                                    Sync with Curve
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={startMainDetailsEdit}
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
                                    Edit
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="reference-highlights" aria-label="Client highlights">
                <div className="reference-highlight">
                    <span className="reference-highlight-label">Income Q2 2026</span>
                    <span className="reference-highlight-value">€734</span>
                </div>
                <div className="reference-highlight">
                    <span className="reference-highlight-label">Total income</span>
                    <span className="reference-highlight-value">€35,997</span>
                </div>
                <div className="reference-highlight">
                    <span className="reference-highlight-label">Advance</span>
                    <div
                        className="reference-advance-bar"
                        role="progressbar"
                        aria-label="Advance recouped"
                        aria-valuemin={0}
                        aria-valuemax={50000}
                        aria-valuenow={35997}
                    >
                        <div className="reference-advance-bar-fill" style={{ width: '72%' }} />
                    </div>
                    <span className="reference-highlight-sub">€35,997 of €50,000 recouped</span>
                </div>
                <div className="reference-highlight">
                    <span className="reference-highlight-status reference-highlight-status-success">
                        REGISTERED
                    </span>
                    <span className="reference-highlight-value">33</span>
                </div>
                <div className="reference-highlight">
                    <span className="reference-highlight-status reference-highlight-status-info">
                        SUBMITTED
                    </span>
                    <span className="reference-highlight-value">1</span>
                </div>
                <div className="reference-highlight">
                    <span className="reference-highlight-status reference-highlight-status-warning">
                        TO BE REGISTERED
                    </span>
                    <span className="reference-highlight-value">1</span>
                </div>
            </div>

            <Tabs
                className="reference-tabs"
                value={tabIndex}
                onChange={(_event, nextValue: number) => setTab(tabByIndex[nextValue] ?? 'main')}
                indicatorColor="primary"
                textColor="inherit"
            >
                <Tab label="MAIN DETAILS" />
                <Tab label="REPERTOIRE" />
                <Tab label="STATEMENTS" />
                <Tab label="CMOS" />
            </Tabs>

            {tab === 'main' && (
                <MainDetailsTab
                    client={draftClient}
                    dealSyncStates={dealSyncStates}
                    isEditing={isEditingMainDetails}
                    onClientFieldChange={updateDraftClientField}
                    onDetailFieldChange={updateDraftDetailField}
                    onEditDeal={openDealEditor}
                    onOpenDealSync={() => openSyncDialog(['deals'])}
                />
            )}
            {tab === 'repertoire' && <RepertoireTab assets={client.repertoireAssets} />}
            {tab === 'statements' && <StatementsTab statements={client.statements} />}
            {tab === 'cmos' && <CmosTab registrations={client.cmoRegistrations} />}
            <CurveSyncDialog
                client={draftClient}
                dealSyncStates={dealSyncStates}
                open={isSyncDialogOpen}
                selectedScopes={selectedSyncScopes}
                selectedDealIds={selectedDealIds}
                salesTerms={salesTermConfigs}
                onClose={() => setIsSyncDialogOpen(false)}
                onAddSalesTerm={addSalesTerm}
                onDeleteSalesTerm={deleteSalesTerm}
                onToggleScope={toggleSyncScope}
                onToggleDeal={toggleSelectedDeal}
                onUpdateSalesTerm={updateSalesTerm}
                onSync={syncSelectedItems}
            />
            <TerritoryDealDialog
                accountBalance={draftClient.details.accountBalance}
                deal={editingDeal}
                open={Boolean(editingDeal)}
                onClose={() => setEditingDeal(null)}
                onSave={saveEditedDeal}
                onUpdateDeal={setEditingDeal}
            />
        </section>
    );
}

export default ReferenceClientPage;
