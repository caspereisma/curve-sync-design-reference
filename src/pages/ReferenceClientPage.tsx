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
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link, useParams } from 'react-router-dom';

import { SyncStateIndicator, syncStateLabels } from '../components/SyncStateIndicator';
import {
    getReferenceRightsHolderById,
    referenceCurveSyncData,
    type CmoRegistration,
    type RecoupmentState,
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
                    Sync with Curve
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

function AutoExtendField(): React.ReactElement {
    const [frequency, setFrequency] = useState('none');
    const [period, setPeriod] = useState('');
    const hasFrequency = frequency !== 'none';

    return (
        <div className="reference-autoextend-field">
            <span className="reference-autoextend-label">Autoextend every</span>
            <Select
                variant="standard"
                className={`reference-autoextend-select${hasFrequency ? '' : ' placeholder'}`}
                value={frequency}
                onChange={(event) => {
                    const value = event.target.value;
                    setFrequency(value);
                    if (value === 'none') {
                        setPeriod('');
                    }
                }}
                inputProps={{ 'aria-label': 'Autoextend frequency' }}
                sx={{ width: hasFrequency ? 72 : 140 }}
            >
                <MenuItem value="none">No autoextend</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((count) => (
                    <MenuItem key={count} value={String(count)}>
                        {count}
                    </MenuItem>
                ))}
            </Select>
            {hasFrequency && (
                <Select
                    variant="standard"
                    className={`reference-autoextend-select${period === '' ? ' placeholder' : ''}`}
                    value={period}
                    displayEmpty
                    onChange={(event) => setPeriod(event.target.value)}
                    inputProps={{ 'aria-label': 'Autoextend period' }}
                    sx={{ width: 118 }}
                >
                    <MenuItem value="">&nbsp;</MenuItem>
                    <MenuItem value="Month(s)">Month(s)</MenuItem>
                    <MenuItem value="Year(s)">Year(s)</MenuItem>
                </Select>
            )}
        </div>
    );
}

function AdvanceField({ amount, recoupment }: { amount: string; recoupment: string }): React.ReactElement {
    const hasAdvance = recoupment === 'in-recoupment' || recoupment === 'recouped';

    return (
        <div className="reference-field">
            <span className="reference-field-label">Advance</span>
            <div className="reference-field-value">
                <span className="reference-advance-currency">€</span>
                {hasAdvance && <span>{amount}</span>}
            </div>
            {recoupment === 'recouped' && (
                <span className="reference-advance-status recouped" role="status">
                    <span className="reference-status-dot" aria-hidden="true" />
                    Recouped
                </span>
            )}
            {recoupment === 'in-recoupment' && (
                <span className="reference-advance-status in-recoupment" role="status">
                    <span className="reference-status-dot" aria-hidden="true" />
                    In recoupment
                </span>
            )}
        </div>
    );
}

function TerritoryDealsTable({
    deals,
    accountBalance,
    isEditing,
    onEditDeal
}: {
    deals: TerritoryDeal[];
    accountBalance: string;
    isEditing: boolean;
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
            {deals.map((deal) => (
                <div key={deal.id} className="reference-table-row territory-deal-grid" role="row">
                    <div className="reference-table-cell reference-territory-name-cell" role="cell">
                        <SyncStateIndicator state={deal.syncState} />
                        <span>{deal.territories}</span>
                    </div>
                    <div className="reference-table-cell" role="cell">
                        {getDealRateLabel(deal, accountBalance)}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        {deal.startDate}
                    </div>
                    <div className="reference-table-cell" role="cell">
                        {deal.endDate}
                    </div>
                    <div className="reference-table-cell reference-status-cell" role="cell">
                        <span className={`reference-status ${deal.status.toLowerCase()}`}>{deal.status}</span>
                    </div>
                    <div className="reference-table-cell reference-table-icons" role="cell" aria-label="Deal actions">
                        <button
                            className="reference-icon-button"
                            type="button"
                            aria-label={`Edit ${deal.territories} ${deal.startDate} deal`}
                            disabled={!isEditing}
                            onClick={() => onEditDeal(deal)}
                        >
                            <EditOutlinedIcon />
                        </button>
                        <button
                            className="reference-icon-button"
                            type="button"
                            aria-label={`Delete ${deal.territories} ${deal.startDate} deal`}
                            disabled={!isEditing}
                        >
                            <DeleteOutlineIcon />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MainDetailsTab({
    client,
    isEditing,
    onClientFieldChange,
    onDetailFieldChange,
    onEditDeal
}: {
    client: RightsHolderClient;
    isEditing: boolean;
    onClientFieldChange: (_field: 'clientName' | 'dealStartDate' | 'tier', _value: string) => void;
    onDetailFieldChange: (_field: keyof RightsHolderClientDetails, _value: string) => void;
    onEditDeal: (_deal: TerritoryDeal) => void;
}): React.ReactElement {
    const [activeSection, setActiveSection] = useState(mainDetailSections[0].id);
    const { details } = client;
    const showOutOfSync = client.syncState === 'requires-sync';
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
                            outOfSync={showOutOfSync}
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
                            outOfSync={showOutOfSync}
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
                        <AdvanceField amount={details.advanceAmount} recoupment={details.advanceRecoupment} />
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
                        isEditing={isEditing}
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
                            outOfSync={showOutOfSync}
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

const emptyValue = 'Empty';
const payeeId = referenceCurveSyncData.contract.payeeId;

const parseMoneyValue = (value: string): number => {
    const numericValue = Number(value.replace(/[€, $]/g, '').replace(/,/g, '').trim());

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

const clientDataFieldLabels: Record<string, string> = {
    foreignId: 'Foreign ID',
    name: 'Name',
    alternateName: 'Alternate name',
    country: 'Country',
    address: 'Address',
    contactEmail: 'Contact email',
    payeeCategories: 'Categories',
    currency: 'Currency'
};

const clientDataFieldCaptions: Record<string, string> = {
    name: 'Payee & Contract',
    currency: 'Contract'
};

function ClientDataComparisonTable({
    payee,
    contract
}: {
    payee: CurvePayloadField[];
    contract: CurvePayloadField[];
}): React.ReactElement {
    const currencyRow = contract.find((row) => row.field === 'currency');
    const rows = [...payee, ...(currencyRow ? [currencyRow] : [])];

    return (
        <>
            <p className="reference-curve-desc">
                {'Fields apply to Payee’s unless otherwise indicated'}
            </p>
            <div className="reference-curve-table" role="table" aria-label="Client and contract data">
                <div className="reference-curve-row reference-curve-head" role="row">
                    <div role="columnheader">Field</div>
                    <div role="columnheader">NR source value</div>
                    <div role="columnheader">Curve value will be overridden</div>
                    <div role="columnheader">Status</div>
                </div>
            {rows.map((row) => {
                const changed = !row.immutable && shouldHighlightPayloadChange(row.curveValue, row.nrValue);
                const caption = clientDataFieldCaptions[row.field];
                const nrMeaningful = !isEmptyPayloadValue(row.nrValue);

                return (
                    <div className="reference-curve-row" role="row" key={row.id}>
                        <div role="cell" className={`reference-curve-field${changed || caption ? '' : ' muted'}`}>
                            <span>{clientDataFieldLabels[row.field] ?? row.field}</span>
                            {caption && <span className="reference-curve-caption">{caption}</span>}
                        </div>
                        <div
                            role="cell"
                            className={changed && nrMeaningful ? 'reference-curve-nr-override' : 'reference-curve-muted'}
                        >
                            {row.nrValue}
                        </div>
                        <div role="cell" className={changed ? 'reference-curve-strike' : 'reference-curve-muted'}>
                            {row.curveValue}
                        </div>
                        <div role="cell">
                            <span className={`reference-curve-status ${changed ? 'override' : 'current-curve'}`}>
                                {changed ? 'Override' : 'No change'}
                            </span>
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

interface CmoRateOverride {
    cmo: string;
    rate: string;
}

interface CmoOverrideSection {
    territory: string;
    coveredCmos: string;
    rate: string;
    rateCaption: string;
    expandable?: boolean;
    overridable?: boolean;
    overrides: CmoRateOverride[];
}

const worldCmoTerritories =
    'ABRAMUS BR, ACTRA RACS CA, ADAMI FR, AGATA LT, AGEDI ES, AIE ES, ALL, APOLLON GR, AUDIOGEST PT, CONNECT CA, CPRA JP, CREDIDAM RO, EFU EE, EJI HU, ERATO GR, GDA PT, GRAMEX DK, GRAMEX FI, GRAMMO GR, GRAMO NO, GVL DE, HUZIP HR, IE Sources, IFPI SE, IMAGIA BE, INTERGRAM CZ, IPF ZAVOD SI, ITSRIGHT IT, KNR, KOBALT, LAIPA LV, LSG AT, MAHASZ HU, MROC CA, NORMA NL, NUOVO IMAIE IT, PI RS, PIRS, PLAYRIGHT BE, PPCA AU, PPI IE, PPL UK, PPNZ AU, PPNZ NZ, PROPHON BG, RAAP IE, RIAJ JP, RMNZ NZ, SAMI SE, SAMPRA ZA, SCF IT, SCPP FR, SENA, SENA NL, SIMIM BE, SLOVGRAM SK, SPEDIDAM FR, SPPF FR, STOART PL, SWISSPERFORM CH, UK Sources, UMA UA, VPL UK, ZAPRAF HR, ZPAV PL';

const rightsHolderSyncNote =
    'Because this is a Rights Holder client, by default a Performer all sources rate at 0% will be synced to Curve';

const slidingScaleRateCaption = 'Sliding scale rate: < €50,000 (12.5%); > €50,000 (5%)';

interface CmoRateOverridesConfig {
    note: string;
    sections: CmoOverrideSection[];
}

const cmoRateOverridesByClient: Record<string, CmoRateOverridesConfig> = {
    // 1008B Records s
    '172': {
        note: rightsHolderSyncNote,
        sections: [
            {
                territory: 'World excluding US',
                coveredCmos: worldCmoTerritories,
                rate: '5%',
                rateCaption: slidingScaleRateCaption,
                expandable: true,
                overridable: false,
                overrides: []
            },
            {
                territory: 'US',
                coveredCmos: 'AFTRA US, AFM-AFTRA US, SoundExchange US, SOUNDEXCHANGE US',
                rate: '5%',
                rateCaption: slidingScaleRateCaption,
                overridable: true,
                overrides: [
                    { cmo: 'AFM SAGAFTRA US', rate: '8%' },
                    { cmo: 'SoundExchange US', rate: '4%' }
                ]
            }
        ]
    },
    // 1008C Records now renders via cmoRateSyncByClient (new-generation dialog).
};

interface CmoRateSyncSectionConfig {
    territory: string;
    caption: string;
    coveredCmos: string;
    // 'base': one combined row listing all covered CMOs (the catch-all deal).
    // 'per-cmo': one row per CMO with an edit action (territory exclusions,
    // Figma 10841-42545 / 10841-43042 / 10841-43331).
    variant: 'base' | 'per-cmo';
    overrides?: Record<string, string>;
}

interface CmoRateSyncConfig {
    note: string;
    sections: CmoRateSyncSectionConfig[];
}

const exclusionSectionCaption =
    'Default CMO territories are the CMOs that are included in this territory deal by default. Add an override for CMOs with a rate that is different from the default rate';

const cmoOverrideKey = (territory: string, cmo: string, tierIndex: number | null = null): string =>
    `${territory}|${cmo}${tierIndex === null ? '' : `|t${tierIndex}`}`;

// Sliding-scale helpers: the active tier follows the client's account balance
// relative to the income switch point(s).
const getActiveTierIndex = (client: RightsHolderClient): number | null => {
    const deal = client.territoryDeals.find(
        (territoryDeal) => territoryDeal.rateType === 'sliding' && territoryDeal.slidingScale?.length
    );
    if (!deal?.slidingScale?.length) {
        return null;
    }
    const balance = parseMoneyValue(client.details.accountBalance);
    let index = deal.slidingScale.findIndex(
        (tier) => tier.to !== 'above' && balance <= parseMoneyValue(tier.to)
    );
    if (index === -1) {
        index = deal.slidingScale.findIndex((tier) => tier.to === 'above');
    }
    return index === -1 ? null : index;
};

const getTierRate = (deal: TerritoryDeal, tierIndex: number | null): string =>
    tierIndex === null ? deal.rate : (deal.slidingScale?.[tierIndex]?.rate ?? deal.rate);

const tierCaption = (tiers: NonNullable<TerritoryDeal['slidingScale']>, index: number): string => {
    const tier = tiers[index];
    if (tier.to === 'above') {
        const previous = tiers[index - 1];
        return `> ${formatMoneyLabel(previous?.to ?? '0')} (${tier.rate})`;
    }
    return `< ${formatMoneyLabel(tier.to)} (${tier.rate})`;
};

// Seed the mutable override state from the per-client config.
const buildInitialCmoOverrides = (clientId: string): Record<string, string> => {
    const config = cmoRateSyncByClient[clientId];
    const map: Record<string, string> = {};
    config?.sections.forEach((section) => {
        Object.entries(section.overrides ?? {}).forEach(([cmo, rate]) => {
            map[cmoOverrideKey(section.territory, cmo)] = rate;
        });
    });
    return map;
};

// Territory-deals tab redesign (Figma 10841-36612 / 10841-37752): per-territory
// CMO rate table comparing the NRP rate against the rate currently in Curve.
const cmoRateSyncByClient: Record<string, CmoRateSyncConfig> = {
    // 1008B Records s (sliding scale — sections repeat per rate tier)
    '172': {
        note: rightsHolderSyncNote,
        sections: [
            {
                territory: 'World excluding US',
                caption:
                    'Worldwide CMOs default set excluding any territory-specific deals which found below. Rate in NRP vs currently in Curve.',
                coveredCmos: worldCmoTerritories,
                variant: 'base'
            },
            {
                territory: 'US',
                caption: exclusionSectionCaption,
                coveredCmos: 'SOUNDEXCHANGE US, AFTRA US, AFM-AFTRA US, SoundExchange US',
                variant: 'per-cmo'
            }
        ]
    },
    // 1008C Records
    '173': {
        note: rightsHolderSyncNote,
        sections: [
            {
                territory: 'World excluding ES, UK',
                caption:
                    'Worldwide CMOs default set excluding any territory-specific deals which found below. Rate in NRP vs currently in Curve.',
                coveredCmos: worldCmoTerritories,
                variant: 'base'
            },
            {
                territory: 'ES',
                caption: exclusionSectionCaption,
                coveredCmos: 'AGEDI ES, AIE ES',
                variant: 'per-cmo',
                overrides: { 'AGEDI ES': '5%' }
            },
            {
                territory: 'UK',
                caption: exclusionSectionCaption,
                coveredCmos: 'VPL UK, PPL UK',
                variant: 'per-cmo'
            }
        ]
    },
    // 1008D Records
    '174': {
        note: rightsHolderSyncNote,
        sections: [
            {
                territory: 'World',
                caption:
                    'Worldwide CMOs default set excluding any territory-specific deals which found below. Rate in NRP vs currently in Curve.',
                coveredCmos: worldCmoTerritories,
                variant: 'base'
            }
        ]
    }
};

// Client-data tab redesign (Figma 10722-10703 / 10840-35902 / 10620-10309):
// Field · NRP value · Curve value · Sync action. Row state is derived per field
// by diffing the current client against the last-synced snapshot: never synced →
// "Not yet synced"; value changed since snapshot → "Sync required" (old Curve
// value struck through); otherwise "In sync".
const clientDataSyncRows: Array<{
    field: string;
    caption?: string;
    muted?: boolean;
    getValue: (_client: RightsHolderClient) => string;
}> = [
    { field: 'Foreign ID', muted: true, getValue: (c) => c.details.nrpClientId || c.id },
    { field: 'Name', caption: 'Payee & Contract', getValue: (c) => c.clientName || 'Not set' },
    { field: 'Alternate name', getValue: () => 'Not set' },
    { field: 'Country', getValue: (c) => c.details.bankCountry || 'Not set' },
    { field: 'Address', muted: true, getValue: (c) => c.details.businessRegisteredAddress || 'Not set' },
    { field: 'Contact email', muted: true, getValue: (c) => c.details.billingEmail || 'Not set' },
    { field: 'Categories', muted: true, getValue: () => 'Rights Holder' },
    { field: 'Currency', caption: 'Contract', getValue: (c) => c.details.currency || 'Not set' }
];

type SyncRowStatus = 'not-synced' | 'sync-required' | 'in-sync' | 'not-active';

const syncRowStatusPresentation: Record<SyncRowStatus, { label: string; className: string }> = {
    'in-sync': { label: 'In sync', className: 'insync' },
    'sync-required': { label: 'Sync required', className: 'syncrequired' },
    'not-synced': { label: 'Not yet synced', className: 'notsynced' },
    'not-active': { label: 'Not active', className: 'notactive' }
};

function SyncActionLabel({ status }: { status: SyncRowStatus }): React.ReactElement {
    const { label, className } = syncRowStatusPresentation[status];
    return (
        <div role="cell" className={`syncaction ${className}`}>
            {status === 'not-active' ? <SyncDisabledIcon sx={{ fontSize: 20 }} /> : <SyncIcon sx={{ fontSize: 20 }} />}
            {label}
        </div>
    );
}

function ClientDataSyncTable({
    client,
    lastSyncedClient
}: {
    client: RightsHolderClient;
    lastSyncedClient: RightsHolderClient | null;
}): React.ReactElement {
    return (
        <div className="reference-client-sync">
            <p className="reference-cmo-desc">Fields apply to Payee&rsquo;s unless otherwise indicated</p>
            <div className="reference-client-sync-table" role="table" aria-label="Client data sync payload">
                <div className="reference-client-sync-row reference-client-sync-head" role="row">
                    <div role="columnheader">Field</div>
                    <div role="columnheader">NRP value</div>
                    <div role="columnheader">Curve value</div>
                    <div role="columnheader">Sync action</div>
                </div>
                {clientDataSyncRows.map((row) => {
                    const nrpValue = row.getValue(client);
                    const curveValue = lastSyncedClient ? row.getValue(lastSyncedClient) : null;
                    const status: SyncRowStatus =
                        curveValue === null
                            ? 'not-synced'
                            : nrpValue !== curveValue
                              ? 'sync-required'
                              : 'in-sync';
                    return (
                        <div className="reference-client-sync-row" role="row" key={row.field}>
                            <div
                                role="cell"
                                className={`field${status === 'not-synced' && row.muted ? ' muted' : ''}`}
                            >
                                <span>{row.field}</span>
                                {row.caption && <span className="caption">{row.caption}</span>}
                            </div>
                            <div role="cell" className={`value${status === 'in-sync' ? '' : ' pending'}`}>
                                {nrpValue}
                            </div>
                            <div
                                role="cell"
                                className={`value${
                                    status === 'not-synced' ? ' muted' : status === 'sync-required' ? ' old' : ''
                                }`}
                            >
                                {curveValue ?? '-'}
                            </div>
                            <SyncActionLabel status={status} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const cmoRowStatusOf = (nrpRate: string, curveRate: string | null): SyncRowStatus =>
    curveRate === null ? 'not-synced' : nrpRate !== curveRate ? 'sync-required' : 'in-sync';

interface CmoRateRow {
    key: string;
    label: string;
    clamp: boolean;
    editable: boolean;
    nrpRate: string;
    curveRate: string | null;
    status: SyncRowStatus;
    hasPendingOverride: boolean;
}

interface CmoTierContext {
    tierIndex: number;
    activeTierIndex: number;
    lastSyncedTierIndex: number | null;
}

const buildCmoRateRows = (
    section: CmoRateSyncSectionConfig,
    client: RightsHolderClient,
    lastSyncedClient: RightsHolderClient | null,
    overrides: Record<string, string>,
    lastSyncedOverrides: Record<string, string>,
    tierCtx?: CmoTierContext
): CmoRateRow[] => {
    const deal = client.territoryDeals.find((territoryDeal) => territoryDeal.territories === section.territory);
    const lastDeal = lastSyncedClient?.territoryDeals.find((territoryDeal) => territoryDeal.id === deal?.id);
    const tierIndex = tierCtx?.tierIndex ?? null;
    const isActiveTier = !tierCtx || tierCtx.tierIndex === tierCtx.activeTierIndex;
    const lastTierIndex = tierCtx ? tierCtx.lastSyncedTierIndex : null;
    const currentDealRate = deal ? getTierRate(deal, tierIndex) : '—';
    const curveDealRate = lastDeal ? getTierRate(lastDeal, lastTierIndex) : null;
    if (section.variant !== 'per-cmo') {
        return [
            {
                key: 'all',
                label: section.coveredCmos,
                clamp: true,
                editable: false,
                nrpRate: currentDealRate,
                curveRate: curveDealRate,
                status: isActiveTier ? cmoRowStatusOf(currentDealRate, curveDealRate) : 'not-active',
                hasPendingOverride: false
            }
        ];
    }
    return section.coveredCmos
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((cmo) => {
            const key = cmoOverrideKey(section.territory, cmo, tierIndex);
            const curveKey = cmoOverrideKey(section.territory, cmo, lastTierIndex);
            const currentOverride = overrides[key];
            const nrpRate = currentOverride ?? currentDealRate;
            const curveRate = lastDeal ? (lastSyncedOverrides[curveKey] ?? curveDealRate) : null;
            const status = isActiveTier ? cmoRowStatusOf(nrpRate, curveRate) : 'not-active';
            return {
                key,
                label: cmo,
                clamp: false,
                editable: isActiveTier,
                nrpRate,
                curveRate,
                status,
                hasPendingOverride:
                    status === 'sync-required' && currentOverride !== undefined && currentOverride !== curveRate
            };
        });
};

function CmoRateSyncPanel({
    config,
    client,
    lastSyncedClient,
    cmoOverrides,
    lastSyncedOverrides,
    onSaveOverride
}: {
    config: CmoRateSyncConfig;
    client: RightsHolderClient;
    lastSyncedClient: RightsHolderClient | null;
    cmoOverrides: Record<string, string>;
    lastSyncedOverrides: Record<string, string>;
    onSaveOverride: (_territory: string, _cmo: string, _rate: string, _tierIndex: number | null) => void;
}): React.ReactElement {
    const [editingRow, setEditingRow] = useState<{
        key: string;
        territory: string;
        cmo: string;
        tierIndex: number | null;
        draft: string;
    } | null>(null);
    const rateTypes = Array.from(new Set(client.territoryDeals.map((deal) => deal.rateType)));
    const rateTypeLabel = rateTypes.length === 1 ? rateTypes[0] : 'mixed';
    const slidingDeal = client.territoryDeals.find(
        (deal) => deal.rateType === 'sliding' && deal.slidingScale?.length
    );
    const slidingTiers = slidingDeal?.slidingScale ?? null;
    const activeTierIndex = getActiveTierIndex(client) ?? 0;
    const lastSyncedTierIndex = lastSyncedClient ? getActiveTierIndex(lastSyncedClient) : null;
    const rateTypeText = slidingTiers
        ? `sliding scale ${slidingTiers.map((_, index) => tierCaption(slidingTiers, index)).join('; ')}`
        : rateTypeLabel;

    const renderSectionCard = (section: CmoRateSyncSectionConfig, tierCtx?: CmoTierContext): React.ReactElement => {
        const rows = buildCmoRateRows(section, client, lastSyncedClient, cmoOverrides, lastSyncedOverrides, tierCtx);
        const disabled = Boolean(tierCtx && tierCtx.tierIndex !== tierCtx.activeTierIndex);
        return (
                    <div
                        className={`reference-cmo-card${disabled ? ' disabled' : ''}`}
                        key={`${section.territory}${tierCtx ? `-t${tierCtx.tierIndex}` : ''}`}
                    >
                        <h5 className="reference-cmo-card-title">{section.territory}</h5>
                        <span className="reference-cmo-card-caption">{section.caption}</span>
                        <div
                            className="reference-cmo-rate-table"
                            role="table"
                            aria-label={`CMO rates for ${section.territory}`}
                        >
                            <div className="reference-cmo-rate-row reference-cmo-rate-head" role="row">
                                <div role="columnheader">CMO</div>
                                <div role="columnheader" className="num">
                                    NRP rate
                                </div>
                                <div role="columnheader" className="num">
                                    Curve rate
                                </div>
                                <div role="columnheader">Sync action</div>
                                <div role="columnheader" aria-label="Row actions" />
                            </div>
                            {rows.map((row) => {
                                const isEditing = editingRow?.key === row.key;
                                const saveEdit = (): void => {
                                    if (!editingRow || !editingRow.draft.trim()) {
                                        setEditingRow(null);
                                        return;
                                    }
                                    onSaveOverride(
                                        editingRow.territory,
                                        editingRow.cmo,
                                        editingRow.draft,
                                        editingRow.tierIndex
                                    );
                                    setEditingRow(null);
                                };
                                return (
                                    <div
                                        className={`reference-cmo-rate-row${row.clamp ? '' : ' compact'}`}
                                        role="row"
                                        key={row.key}
                                    >
                                        <div role="cell" className="cmos">
                                            <span className={row.clamp ? 'cmos-text' : undefined}>
                                                {row.label}
                                            </span>
                                        </div>
                                        {isEditing ? (
                                            <div role="cell" className="num editing">
                                                <TextField
                                                    variant="standard"
                                                    size="small"
                                                    autoFocus
                                                    value={editingRow?.draft ?? ''}
                                                    inputProps={{ 'aria-label': `${row.label} NRP rate` }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">%</InputAdornment>
                                                        )
                                                    }}
                                                    onChange={(event) =>
                                                        setEditingRow((current) =>
                                                            current
                                                                ? { ...current, draft: event.target.value }
                                                                : current
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') {
                                                            saveEdit();
                                                        }
                                                        if (event.key === 'Escape') {
                                                            setEditingRow(null);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                role="cell"
                                                className={`num${row.status === 'in-sync' ? '' : ' pending'}`}
                                            >
                                                {row.nrpRate}
                                                {row.hasPendingOverride && (
                                                    <Tooltip title="Territory deal default rate override">
                                                        <span
                                                            className="reference-cmo-override-warning"
                                                            aria-label="Territory deal default rate override"
                                                        >
                                                            <WarningAmberIcon />
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            role="cell"
                                            className={`num${
                                                isEditing || row.status === 'not-synced'
                                                    ? ''
                                                    : row.status === 'sync-required'
                                                      ? ' old'
                                                      : ''
                                            }`}
                                        >
                                            {row.curveRate ?? '-'}
                                        </div>
                                        {isEditing ? <div role="cell" /> : <SyncActionLabel status={row.status} />}
                                        <div role="cell" className={`actions${isEditing ? ' editing' : ''}`}>
                                            {row.editable && isEditing && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="reference-icon-button"
                                                        aria-label={`Save ${row.label} rate override`}
                                                        onClick={saveEdit}
                                                    >
                                                        <SaveOutlinedIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="reference-icon-button"
                                                        aria-label={`Cancel editing ${row.label} rate`}
                                                        onClick={() => setEditingRow(null)}
                                                    >
                                                        <CloseIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                </>
                                            )}
                                            {row.editable && !isEditing && (
                                                <button
                                                    type="button"
                                                    className="reference-icon-button"
                                                    aria-label={`Edit ${row.label} rate override`}
                                                    onClick={() =>
                                                        setEditingRow({
                                                            key: row.key,
                                                            territory: section.territory,
                                                            cmo: row.label,
                                                            tierIndex: tierCtx?.tierIndex ?? null,
                                                            draft: row.nrpRate.replace(/%$/, '')
                                                        })
                                                    }
                                                >
                                                    <EditOutlinedIcon sx={{ fontSize: 20 }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
        );
    };

    return (
        <div className="reference-cmo-overrides">
            <p className="reference-cmo-desc">{config.note}</p>
            <div className="reference-rate-type">
                <span className="reference-rate-type-label">Rate type: {rateTypeText}</span>
                <span className="reference-rate-type-caption">Applies to all deals</span>
            </div>
            {slidingTiers
                ? slidingTiers.map((tier, index) => (
                      <TierSection
                          key={`${tier.id}-${activeTierIndex}`}
                          title={`Rate tier ${index + 1}: ${tierCaption(slidingTiers, index)}`}
                          active={index === activeTierIndex}
                          defaultExpanded={index === activeTierIndex}
                      >
                          {config.sections.map((section) =>
                              renderSectionCard(section, {
                                  tierIndex: index,
                                  activeTierIndex,
                                  lastSyncedTierIndex
                              })
                          )}
                      </TierSection>
                  ))
                : config.sections.map((section) => renderSectionCard(section))}
        </div>
    );
}

function TierSection({
    title,
    active,
    defaultExpanded,
    children
}: {
    title: string;
    active: boolean;
    defaultExpanded: boolean;
    children: React.ReactNode;
}): React.ReactElement {
    const [expanded, setExpanded] = useState(defaultExpanded);
    return (
        <div className="reference-tier-section">
            <div className="reference-tier-header">
                <span className="reference-tier-title">{title}</span>
                <span className={`reference-tier-chip ${active ? 'active' : 'inactive'}`}>
                    {active ? 'Active rate tier' : 'Inactive rate tier'}
                </span>
                <button
                    type="button"
                    className="reference-icon-button reference-tier-toggle"
                    aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}
                >
                    <KeyboardArrowDownIcon
                        sx={{ fontSize: 24, transform: expanded ? 'rotate(180deg)' : 'none' }}
                    />
                </button>
            </div>
            {expanded && <div className="reference-tier-body">{children}</div>}
        </div>
    );
}

function CmoOverrideTable({ section }: { section: CmoOverrideSection }): React.ReactElement {
    const [overrides, setOverrides] = useState<CmoRateOverride[]>(section.overrides);
    const [isAdding, setIsAdding] = useState(false);
    const [draftCmo, setDraftCmo] = useState('');
    const [draftRate, setDraftRate] = useState('');
    const cmoOptions = useMemo(
        () => section.coveredCmos.split(',').map((value) => value.trim()).filter(Boolean),
        [section.coveredCmos]
    );
    const canSave = draftCmo !== '' && draftRate.trim() !== '';

    const startAdding = (): void => {
        setDraftCmo('');
        setDraftRate('');
        setIsAdding(true);
    };
    const cancelAdding = (): void => {
        setIsAdding(false);
        setDraftCmo('');
        setDraftRate('');
    };
    const saveOverride = (): void => {
        if (!canSave) {
            return;
        }
        const trimmedRate = draftRate.trim();
        const rate = trimmedRate.endsWith('%') ? trimmedRate : `${trimmedRate}%`;
        setOverrides((current) => [...current, { cmo: draftCmo, rate }]);
        cancelAdding();
    };
    const deleteOverride = (cmo: string): void => {
        setOverrides((current) => current.filter((override) => override.cmo !== cmo));
    };

    return (
        <div className="reference-cmo-table" role="table" aria-label={`CMO rate overrides for ${section.territory}`}>
            <div className="reference-cmo-row reference-cmo-head" role="row">
                <div role="columnheader">CMO</div>
                <div role="columnheader">Rate</div>
                <div role="columnheader" className="reference-cmo-col-status">
                    Status
                </div>
                <div role="columnheader" className="reference-cmo-col-actions" aria-label="Row actions" />
            </div>
            {overrides.map((override) => (
                <div className="reference-cmo-row" role="row" key={override.cmo}>
                    <div role="cell">{override.cmo}</div>
                    <div role="cell">
                        <span className="reference-cmo-rate-override">{override.rate}</span>
                    </div>
                    <div role="cell" className="reference-cmo-col-status">
                        <span className="reference-curve-status override">Override</span>
                    </div>
                    <div role="cell" className="reference-cmo-col-actions">
                        <button
                            type="button"
                            className="reference-icon-button"
                            aria-label={`Delete ${override.cmo} override`}
                            onClick={() => deleteOverride(override.cmo)}
                        >
                            <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>
            ))}
            {overrides.length === 0 && !isAdding && (
                <div className="reference-cmo-row reference-cmo-empty" role="row">
                    <div role="cell">No overrides</div>
                </div>
            )}
            {isAdding && (
                <div className="reference-cmo-row reference-cmo-addrow" role="row">
                    <div role="cell">
                        <select
                            className="reference-cmo-field"
                            aria-label="Select CMO"
                            value={draftCmo}
                            onChange={(event) => setDraftCmo(event.target.value)}
                        >
                            <option value="" disabled>
                                Select CMO
                            </option>
                            {cmoOptions.map((cmo) => (
                                <option key={cmo} value={cmo}>
                                    {cmo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div role="cell">
                        <input
                            className="reference-cmo-field"
                            aria-label="Type rate"
                            placeholder="Type rate"
                            value={draftRate}
                            onChange={(event) => setDraftRate(event.target.value)}
                        />
                    </div>
                    <div role="cell" className="reference-cmo-col-status" />
                    <div role="cell" className="reference-cmo-col-actions">
                        <button
                            type="button"
                            className="reference-icon-button"
                            aria-label="Save override"
                            disabled={!canSave}
                            onClick={saveOverride}
                        >
                            <SaveOutlinedIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            type="button"
                            className="reference-icon-button"
                            aria-label="Cancel override"
                            onClick={cancelAdding}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>
            )}
            <div className="reference-cmo-addbtn-row">
                <button type="button" className="reference-cmo-addbtn" disabled={isAdding} onClick={startAdding}>
                    <AddIcon sx={{ fontSize: 18 }} />
                    Add CMO rate override
                </button>
            </div>
        </div>
    );
}

function CmoTerritoryCard({ section }: { section: CmoOverrideSection }): React.ReactElement {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="reference-cmo-card">
            <h5 className="reference-cmo-card-title">{section.territory}</h5>
            <div className="reference-cmo-summary-row">
                <span className="reference-cmo-summary-label">Rate:</span>
                <span className="reference-cmo-summary-value">{section.rate}</span>
                {section.rateCaption && (
                    <span className="reference-cmo-summary-caption">{section.rateCaption}</span>
                )}
            </div>
            <div className="reference-cmo-summary-row">
                <span className="reference-cmo-summary-label">CMO-territories</span>
                <span className={`reference-cmo-summary-list${expanded ? ' expanded' : ''}`}>
                    {section.coveredCmos}
                </span>
                {section.expandable && (
                    <button
                        type="button"
                        className="reference-icon-button"
                        aria-label={expanded ? 'Collapse CMO-territories' : 'Expand CMO-territories'}
                        onClick={() => setExpanded((value) => !value)}
                    >
                        <KeyboardArrowDownIcon
                            sx={{ fontSize: 20, transform: expanded ? 'rotate(180deg)' : 'none' }}
                        />
                    </button>
                )}
            </div>
            {section.overridable && <CmoOverrideTable section={section} />}
        </div>
    );
}

function CmoRateOverrides({ note, sections }: CmoRateOverridesConfig): React.ReactElement {
    return (
        <div className="reference-cmo-overrides">
            <p className="reference-cmo-desc">{note}</p>
            {sections.map((section) => (
                <CmoTerritoryCard section={section} key={section.territory} />
            ))}
        </div>
    );
}

function CurveSyncDialog({
    client,
    lastSyncedClient,
    cmoOverrides,
    lastSyncedOverrides,
    onSaveOverride,
    open,
    selectedScopes,
    onClose,
    onSync
}: {
    client: RightsHolderClient;
    lastSyncedClient: RightsHolderClient | null;
    cmoOverrides: Record<string, string>;
    lastSyncedOverrides: Record<string, string>;
    onSaveOverride: (_territory: string, _cmo: string, _rate: string, _tierIndex: number | null) => void;
    open: boolean;
    selectedScopes: CurveSyncScope[];
    onClose: () => void;
    onSync: () => void;
}): React.ReactElement {
    const [activeScopeTab, setActiveScopeTab] = useState<CurveSyncScope>('client');
    const payeePayload = buildPayeePayload(client);
    const contractPayload = buildContractPayload(client);
    const cmoConfig = cmoRateOverridesByClient[client.id];
    const cmoSyncConfig = cmoRateSyncByClient[client.id];
    const hasSelectedScope = selectedScopes.length > 0;
    const clientDataInSync =
        lastSyncedClient !== null &&
        clientDataSyncRows.every((row) => row.getValue(client) === row.getValue(lastSyncedClient));
    const dealsInSync =
        lastSyncedClient !== null &&
        client.territoryDeals.every((deal) => {
            const lastDeal = lastSyncedClient.territoryDeals.find(
                (territoryDeal) => territoryDeal.id === deal.id
            );
            return Boolean(lastDeal) && deal.rate === lastDeal?.rate;
        });
    const slidingTiersForSync = client.territoryDeals.find(
        (deal) => deal.rateType === 'sliding' && deal.slidingScale?.length
    )?.slidingScale;
    const tierContextsForSync: Array<CmoTierContext | undefined> = slidingTiersForSync
        ? slidingTiersForSync.map((_, index) => ({
              tierIndex: index,
              activeTierIndex: getActiveTierIndex(client) ?? 0,
              lastSyncedTierIndex: lastSyncedClient ? getActiveTierIndex(lastSyncedClient) : null
          }))
        : [undefined];
    const cmoRowsInSync =
        !cmoSyncConfig ||
        cmoSyncConfig.sections.every((section) =>
            tierContextsForSync.every((tierCtx) =>
                buildCmoRateRows(
                    section,
                    client,
                    lastSyncedClient,
                    cmoOverrides,
                    lastSyncedOverrides,
                    tierCtx
                ).every((row) => row.status === 'in-sync' || row.status === 'not-active')
            )
        );
    const allInSync = Boolean(cmoSyncConfig) && clientDataInSync && dealsInSync && cmoRowsInSync;

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

                    {activeScopeTab === 'client' &&
                        selectedScopes.includes('client') &&
                        (cmoSyncConfig ? (
                            <ClientDataSyncTable client={client} lastSyncedClient={lastSyncedClient} />
                        ) : (
                            <ClientDataComparisonTable payee={payeePayload} contract={contractPayload} />
                        ))}

                    {activeScopeTab === 'deals' &&
                        selectedScopes.includes('deals') &&
                        (cmoSyncConfig ? (
                            <CmoRateSyncPanel
                                config={cmoSyncConfig}
                                client={client}
                                lastSyncedClient={lastSyncedClient}
                                cmoOverrides={cmoOverrides}
                                lastSyncedOverrides={lastSyncedOverrides}
                                onSaveOverride={onSaveOverride}
                            />
                        ) : (
                            cmoConfig && <CmoRateOverrides note={cmoConfig.note} sections={cmoConfig.sections} />
                        ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" disabled={!hasSelectedScope || allInSync} onClick={onSync}>
                    Sync with Curve
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
    const [clientSyncState, setClientSyncState] = useState<SyncState>(client.syncState);
    const [lastSyncedClient, setLastSyncedClient] = useState<RightsHolderClient | null>(() =>
        client.syncState === 'synced' ? cloneRightsHolderClient(client) : null
    );
    const [cmoOverrides, setCmoOverrides] = useState<Record<string, string>>(() =>
        buildInitialCmoOverrides(client.id)
    );
    const [lastSyncedOverrides, setLastSyncedOverrides] = useState<Record<string, string>>(() =>
        client.syncState === 'synced' ? buildInitialCmoOverrides(client.id) : {}
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
        setLastSyncedClient(client.syncState === 'synced' ? cloneRightsHolderClient(client) : null);
        setCmoOverrides(buildInitialCmoOverrides(client.id));
        setLastSyncedOverrides(client.syncState === 'synced' ? buildInitialCmoOverrides(client.id) : {});
        setSelectedSyncScopes(['client', 'deals']);
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

    const openSyncDialog = (scopes: CurveSyncScope[]): void => {
        setSelectedSyncScopes(scopes);
        setIsSyncDialogOpen(true);
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
                          ...editingDeal,
                          syncState: 'requires-sync' as SyncState
                      }
                    : deal
            )
        });

        setDraftClient(updateClientDeal);
        setSavedClient(updateClientDeal);
        markClientAsRequiringSync();
        setEditingDeal(null);
    };

    const syncSelectedItems = (): void => {
        const syncedClient: RightsHolderClient = {
            ...cloneRightsHolderClient(draftClient),
            territoryDeals: draftClient.territoryDeals.map((deal) => ({
                ...deal,
                syncState: 'synced' as SyncState
            }))
        };
        setDraftClient(cloneRightsHolderClient(syncedClient));
        setSavedClient(cloneRightsHolderClient(syncedClient));
        setLastSyncedClient(cloneRightsHolderClient(syncedClient));
        setLastSyncedOverrides({ ...cmoOverrides });
        setClientSyncState('synced');
        setSyncStateBeforeEdit('synced');
        setIsSyncDialogOpen(false);
    };

    const saveCmoRateOverride = (
        territory: string,
        cmo: string,
        rawRate: string,
        tierIndex: number | null
    ): void => {
        const trimmed = rawRate.trim().replace(/%$/, '').trim();
        if (!trimmed) {
            return;
        }
        const rate = `${trimmed}%`;
        const key = cmoOverrideKey(territory, cmo, tierIndex);
        const deal = draftClient.territoryDeals.find(
            (territoryDeal) => territoryDeal.territories === territory
        );
        const defaultRate = deal ? getTierRate(deal, tierIndex) : null;
        setCmoOverrides((current) => {
            const next = { ...current };
            if (defaultRate !== null && rate === defaultRate) {
                delete next[key];
            } else {
                next[key] = rate;
            }
            return next;
        });
        const lastDeal = lastSyncedClient?.territoryDeals.find(
            (territoryDeal) => territoryDeal.id === deal?.id
        );
        const lastTierIndex = lastSyncedClient ? getActiveTierIndex(lastSyncedClient) : null;
        const curveKey = cmoOverrideKey(territory, cmo, tierIndex === null ? null : lastTierIndex);
        const syncedEffectiveRate = lastDeal
            ? (lastSyncedOverrides[curveKey] ?? getTierRate(lastDeal, tierIndex === null ? null : lastTierIndex))
            : null;
        if (syncedEffectiveRate === null || rate !== syncedEffectiveRate) {
            markClientAsRequiringSync();
        }
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
                    <SyncStateIndicator state={clientSyncState} showLabel subject="Curve" />
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
                {client.territoryDeals.some((deal) => deal.rateType === 'sliding') ? (
                    <div className="reference-highlight">
                        <span className="reference-highlight-label">Sliding scale rate: 12.5%</span>
                        <div
                            className="reference-advance-bar"
                            role="progressbar"
                            aria-label="Sliding scale progress to next rate"
                            aria-valuemin={0}
                            aria-valuemax={50000}
                            aria-valuenow={14543}
                        >
                            <div className="reference-advance-bar-fill" style={{ width: '29%' }} />
                        </div>
                        <span className="reference-highlight-sub">€35,457 until €50,000 for 5% rate</span>
                    </div>
                ) : client.details.advanceAmount ? (
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
                ) : null}
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
                    isEditing={isEditingMainDetails}
                    onClientFieldChange={updateDraftClientField}
                    onDetailFieldChange={updateDraftDetailField}
                    onEditDeal={openDealEditor}
                />
            )}
            {tab === 'repertoire' && <RepertoireTab assets={client.repertoireAssets} />}
            {tab === 'statements' && <StatementsTab statements={client.statements} />}
            {tab === 'cmos' && <CmosTab registrations={client.cmoRegistrations} />}
            <CurveSyncDialog
                client={draftClient}
                lastSyncedClient={lastSyncedClient}
                cmoOverrides={cmoOverrides}
                lastSyncedOverrides={lastSyncedOverrides}
                onSaveOverride={saveCmoRateOverride}
                open={isSyncDialogOpen}
                selectedScopes={selectedSyncScopes}
                onClose={() => setIsSyncDialogOpen(false)}
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
