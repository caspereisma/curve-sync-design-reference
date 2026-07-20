import React from 'react';

import SyncIcon from '@mui/icons-material/Sync';

import type { SyncState } from '../mocks/referenceUiData';

const syncStateLabels: Record<SyncState, string> = {
    'not-synced': 'Not synced',
    synced: 'Synced',
    'requires-sync': 'Requires sync'
};

// Label text used when a `subject` prefix is shown, e.g. "Curve: requires sync".
const subjectStateLabels: Record<SyncState, string> = {
    'not-synced': 'Not synced',
    synced: 'synced',
    'requires-sync': 'requires sync'
};

interface SyncStateIndicatorProps {
    state: SyncState;
    showLabel?: boolean;
    subject?: string;
    onClick?: () => void;
    ariaLabel?: string;
}

function SyncStateIndicator({
    state,
    showLabel = false,
    subject,
    onClick,
    ariaLabel
}: SyncStateIndicatorProps): React.ReactElement {
    const className = `reference-sync-state ${state}${onClick ? ' clickable' : ''}`;
    const label = subject ? `${subject}: ${subjectStateLabels[state]}` : syncStateLabels[state];
    const content = (
        <>
            <SyncIcon sx={{ fontSize: 18 }} />
            {showLabel && <span>{label}</span>}
        </>
    );

    if (onClick) {
        return (
            <button
                className={className}
                type="button"
                aria-label={ariaLabel ?? label}
                title={label}
                onClick={onClick}
            >
                {content}
            </button>
        );
    }

    return (
        <span className={className} aria-label={label} title={label}>
            {content}
        </span>
    );
}

export { SyncStateIndicator, syncStateLabels };
