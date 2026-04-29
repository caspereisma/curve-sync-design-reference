/* eslint-disable no-unused-vars */
// MUI Theme Augmentation for Custom Button Variants and Palette Properties
import '@mui/material/styles';
import type { PaletteOptions } from '@mui/material/styles';

export type CustomPaletteOptions = PaletteOptions & {
    error?: PaletteOptions['error'] & { background?: string; oulinedRestingBorder?: string };
    success?: PaletteOptions['success'] & { background?: string; oulinedRestingBorder?: string };
    secondary?: PaletteOptions['secondary'] & { background?: string };
    orange?: {
        content?: string;
        main?: string;
        outlinedRestingBorder?: string;
        outlinedHoverBackground?: string;
    };
    text?: PaletteOptions['text'] & { white?: string };
    grey?: {
        content?: string;
        background?: string;
        hover?: string;
        border?: string;
    };
    chips?: {
        background?: string;
    };
    statusSummary?: {
        exclusiveLicenseDeal?: {
            backgroundColor: string;
            color: string;
        };
        registered?: {
            backgroundColor: string;
            color: string;
        };
        submitted?: {
            backgroundColor: string;
            color: string;
        };
        notAvailable?: {
            backgroundColor: string;
            color: string;
        };
        toBeRegistered?: {
            backgroundColor: string;
            color: string;
        };
        exclusiveLicenseDealRegistered?: {
            backgroundColor: string;
            color: string;
        };
    };
};

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        light: true;
        secondary: true;
    }
}

declare module '@mui/material/styles/components' {
    interface Components {
        MuiDatePicker?: Record<string, unknown>;
    }
}

declare module '@mui/material/styles/createPalette' {
    interface PaletteColor {
        background?: string;
        oulinedRestingBorder?: string;
        content?: string;
        contentText?: string;
        outlinedHoverBackground?: string;
    }

    interface SimplePaletteColorOptions {
        background?: string;
        oulinedRestingBorder?: string;
        content?: string;
        contentText?: string;
        outlinedHoverBackground?: string;
    }

    interface TypeText {
        white?: string;
    }

    interface Color {
        content?: string;
        background?: string;
        hover?: string;
        border?: string;
    }
}

declare module '@mui/material/styles/createTypography' {
    interface TypographyOptions {
        color?: string;
    }
}

declare module '@mui/material/styles/createTheme' {
    interface SimplePaletteColorOptions {
        background?: string;
        oulinedRestingBorder?: string;
        content?: string;
        contentText?: string;
        outlinedHoverBackground?: string;
    }
}

declare module '@mui/material/styles' {
    interface PaletteColor {
        background?: string;
        oulinedRestingBorder?: string;
        content?: string;
        contentText?: string;
        outlinedHoverBackground?: string;
    }

    interface SimplePaletteColorOptions {
        background?: string;
        oulinedRestingBorder?: string;
        content?: string;
        contentText?: string;
        outlinedHoverBackground?: string;
    }

    interface TypeText {
        white?: string;
    }

    interface Color {
        content?: string;
        background?: string;
        hover?: string;
        border?: string;
    }

    interface Palette {
        orange?: {
            content?: string;
            main?: string;
            outlinedRestingBorder?: string;
            outlinedHoverBackground?: string;
        };
        chips?: {
            background?: string;
        };
        statusSummary?: {
            exclusiveLicenseDeal?: {
                backgroundColor: string;
                color: string;
            };
            registered?: {
                backgroundColor: string;
                color: string;
            };
            submitted?: {
                backgroundColor: string;
                color: string;
            };
            notAvailable?: {
                backgroundColor: string;
                color: string;
            };
            toBeRegistered?: {
                backgroundColor: string;
                color: string;
            };
            exclusiveLicenseDealRegistered?: {
                backgroundColor: string;
                color: string;
            };
        };
    }

    interface PaletteOptions {
        orange?: {
            content?: string;
            main?: string;
            outlinedRestingBorder?: string;
            outlinedHoverBackground?: string;
        };
        chips?: {
            background?: string;
        };
        statusSummary?: {
            exclusiveLicenseDeal?: {
                backgroundColor: string;
                color: string;
            };
            registered?: {
                backgroundColor: string;
                color: string;
            };
            submitted?: {
                backgroundColor: string;
                color: string;
            };
            notAvailable?: {
                backgroundColor: string;
                color: string;
            };
            toBeRegistered?: {
                backgroundColor: string;
                color: string;
            };
            exclusiveLicenseDealRegistered?: {
                backgroundColor: string;
                color: string;
            };
        };
    }

    interface TypographyOptions {
        color?: string;
    }
}

declare global {
    namespace MuiTheme {
        interface SimplePaletteColorOptions {
            background?: string;
            oulinedRestingBorder?: string;
            content?: string;
            contentText?: string;
            outlinedHoverBackground?: string;
        }

        interface TypographyOptions {
            color?: string;
        }
    }
}
