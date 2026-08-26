import React from 'react';

interface SlidingScaleDiamondProps {
    passed: boolean;
    className?: string;
}

function SlidingScaleDiamond({ passed, className }: SlidingScaleDiamondProps): React.ReactElement {
    const label = passed
        ? 'Income past sliding scale switch point'
        : 'Income before sliding scale switch point';

    return (
        <span
            className={`reference-indicator-diamond ${passed ? 'green' : 'orange'}${className ? ` ${className}` : ''}`}
            role="img"
            aria-label={label}
            title={label}
        />
    );
}

export { SlidingScaleDiamond };
