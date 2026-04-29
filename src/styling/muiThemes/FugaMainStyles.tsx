import type { FC } from 'react';
import type { Theme, PaletteColorOptions } from '@mui/material/styles';

import GlobalStyles from '@mui/material/GlobalStyles';
import { createTheme } from '@mui/material/styles';

import { FUGA_COLORS, fugaPalette } from '../fugaColors';

const theme: Theme = createTheme({
    palette: {
        ...fugaPalette,
        primary: { main: '#000000' },
        secondary: {
            main: '#fff',
            background: '#404041',
        },
        error: {
            main: '#F44139',
            outlinedRestingBorder: '#EE9A9B',
            background: '#FFEBEE',
            contentText: '#5F2120',
        } as PaletteColorOptions & Record<string, string>,
        warning: {
            main: '#ED6C02',
            outlinedRestingBorder: '#FFB44C',
            background: '#FFF3E0',
            contentText: '#663C00',
        } as PaletteColorOptions & Record<string, string>,
        success: {
            main: '#00A542',
            outlinedRestingBorder: '#56CC82',
            background: '#E3F6E9',
        } as PaletteColorOptions & Record<string, string>,
        orange: {
            content: FUGA_COLORS.ORANGE[900],
            main: FUGA_COLORS.ORANGE[600],
            outlinedRestingBorder: FUGA_COLORS.ORANGE[300],
            outlinedHoverBackground: FUGA_COLORS.ORANGE[50],
        },
        text: {
            primary: '#000000',
            secondary: '#5F5F60',
            white: '#FFFFFF',
        },
        grey: {
            content: FUGA_COLORS.WHITE,
            background: FUGA_COLORS.GREY[800],
            hover: FUGA_COLORS.GREY[600],
            border: FUGA_COLORS.GREY[500],
        },
        chips: {
            background: FUGA_COLORS.FUGA_BLUE[100],
        },
        info: {
            main: FUGA_COLORS.BLUE[600],
        },
        statusSummary: {
            exclusiveLicenseDeal: {
                backgroundColor: '#00A542',
                color: '#FFFFFF',
            },
            registered: {
                backgroundColor: '#00A542',
                color: '#FFFFFF',
            },
            submitted: {
                backgroundColor: '#3D8FC9',
                color: '#FFFFFF',
            },
            notAvailable: {
                backgroundColor: 'rgba(0, 0, 0, 0.38)',
                color: '#FFFFFF',
            },
            toBeRegistered: {
                backgroundColor: '#FCC326',
                color: '#000000DE',
            },
            exclusiveLicenseDealRegistered: {
                backgroundColor: '#00A542',
                color: '#FFFFFF',
            },
        },
    },
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#666666',
                    width: 18,
                    height: 18,
                    fontSize: 18,
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 32,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '1em',
                },
            },
        },
        MuiDatePicker: {
            defaultProps: {
                format: 'yyyy-MM-dd',
                slotProps: {
                    textField: {
                        variant: 'standard',
                    },
                },
            },
            styleOverrides: {
                textField: {
                    '& .MuiInputBase-root': {
                        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
                        '&:hover:not(.Mui-disabled):before': {
                            borderBottom: '1px solid rgba(0, 0, 0, 0.87)',
                        },
                        '&:before': {
                            borderBottom: 'none',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '1rem',
                    },
                },
            },
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    minHeight: '63px',

                    '& .MuiInput-underline.Mui-disabled:before': {
                        borderBottomStyle: 'solid',
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '&[data-readonly="true"]': {
                        pointerEvents: 'none',
                        '& .MuiSelect-select': {
                            cursor: 'default',
                        },
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    // disabled as per design change back
                    // "& span[class*='MuiFormLabel-asterisk']": {
                    //     color: '#FF8800',
                    // },
                },
            },
        },
        MuiButton: {
            variants: [
                {
                    props: { variant: 'light', color: 'primary' },
                    style: {
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    },
                },
                {
                    props: { variant: 'secondary' },
                    style: {
                        padding: '8px 16px',
                        fontSize: '14px',
                        lineHeight: '18px',
                        letterSpacing: '1.25px',
                        fontWeight: '700',
                        textAlign: 'center',
                        fontStyle: 'normal',
                        border: 0,
                        backgroundColor: '#404041',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: 'rgb(115, 115, 116)',
                        },
                        '&:disabled': {
                            backgroundColor: '#737374',
                            color: '#BBBBBD',
                            cursor: 'not-allowed',
                            opacity: 0.8,
                            boxShadow: 'none',
                            '& .MuiSvgIcon-root': {
                                color: '#BBBBBD',
                            },
                        },
                        '& .MuiSvgIcon-root': {
                            color: '#fff',
                        },
                    },
                },
            ],
            styleOverrides: {
                root: {
                    '&.tabBtn': {
                        padding: '8px 16px',
                        position: 'static',
                        height: '48px',
                        left: '0px',
                        top: '32px',
                        textTransform: 'none',
                    },
                },
                outlined: {
                    padding: '7px 16px',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    lineHeight: '18px',
                    letterSpacing: '1.25px',
                    fontWeight: '700',
                    textAlign: 'center',
                    fontStyle: 'normal',
                },
                contained: {
                    padding: '8px 16px',
                    fontSize: '14px',
                    lineHeight: '18px',
                    letterSpacing: '1.25px',
                    fontWeight: '700',
                    textAlign: 'center',
                    fontStyle: 'normal',
                },
                text: {
                    padding: '7px 16px',
                    fontSize: '14px',
                    lineHeight: '18px',
                    letterSpacing: '1.25px',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    color: '#fff',
                    '& .MuiSvgIcon-root': {
                        color: '#fff',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                outlinedPrimary: {
                    color: '#006218',
                    borderRadius: '4px',
                    border: '1px solid #56CC82',
                    padding: '4px 6px',
                    backgroundColor: '#E3F6E9',
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    lineHeight: '14px',
                    textAlign: 'center',
                    letterSpacing: '1.5px',
                    textTransform: 'capitalize',
                },
                outlinedSecondary: {
                    color: '#9B9B9D',
                    borderRadius: '4px',
                    border: '1px solid #BDBCBC',
                    padding: '4px 6px',
                    backgroundColor: '#ECECEE',
                    fontStyle: 'normal',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    lineHeight: '14px',
                    textAlign: 'center',
                    letterSpacing: '1.5px',
                    textTransform: 'capitalize',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                standardInfo: {
                    '& .MuiAlert-icon .MuiSvgIcon-root': {
                        color: FUGA_COLORS.BLUE[600],
                    },
                },
                standardWarning: {
                    '& .MuiAlert-icon .MuiSvgIcon-root': {
                        color: FUGA_COLORS.ORANGE[600],
                    },
                },
                standardError: {
                    '& .MuiAlert-icon .MuiSvgIcon-root': {
                        color: FUGA_COLORS.RED[500],
                    },
                },
                standardSuccess: {
                    '& .MuiAlert-icon .MuiSvgIcon-root': {
                        color: FUGA_COLORS.GREEN[600],
                    },
                },
                outlinedError: { borderColor: '#F44139', backgroundColor: '#FFEBEE' },
                outlinedSuccess: { borderColor: '#00A542', backgroundColor: '#E3F6E9' },
                outlinedWarning: { borderColor: '#FF9800', backgroundColor: '#FFF3E0' },
            },
        },
        MuiLink: {
            styleOverrides: {
                underlineHover: {
                    '&:hover': { color: '#5F5F60' },
                },
            },
        },
    },
    typography: {
        fontFamily: 'Nunito Sans, sans-serif',
        color: '#1F1F21',
        body1: {
            color: '#1F1F21',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '16px',
            lineHeight: '22px',
            letterSpacing: '0.5px',
        },
        body2: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '14px',
            lineHeight: '19px',
            letterSpacing: '0.25px',
        },
        h6: {
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '20px',
            lineHeight: '27px',
            letterSpacing: '0.15px',
            textAlign: 'left',
        },
        h5: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '24px',
            lineHeight: '33px',
            letterSpacing: '0.15px',
        },
        h4: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '36px',
            lineHeight: '42px',
            letterSpacing: '0.25px',
        },
        h3: {
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '48px',
            lineHeight: '65px',
            letterSpacing: '0.25px',
        },
        h2: {
            fontStyle: 'normal',
            fontWeight: '300',
            fontSize: '64px',
            lineHeight: '87px',
            letterSpacing: '-0.5px',
        },
        h1: {
            fontStyle: 'normal',
            fontWeight: '300',
            fontSize: '96px',
            lineHeight: '131px',
            letterSpacing: '-1.5px',
        },
        subtitle1: {
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '16px',
            lineHeight: '22px',
            letterSpacing: '0.15px',
        },
        subtitle2: {
            fontStyle: 'normal',
            fontWeight: '700',
            fontSize: '14px',
            lineHeight: '19px',
            letterSpacing: '0.1px',
        },
        caption: {
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '12px',
            lineHeight: '12px',
            letterSpacing: '0.4px',
            color: '#5F5F60',
        },
    },
});

// Global styles for elements like tables, input fields, etc.
const GlobalStyleOverrides: FC = () => (
    <GlobalStyles
        styles={{
            body: { fontFamily: 'sans-serif' },
            table: {
                borderSpacing: '0',
                border: '1px solid #ededed',
                '& tr:last-of-type td': {
                    borderBottom: 0,
                },
                '& th, & td': {
                    margin: 0,
                    padding: '0.5rem',
                    borderBottom: '1px solid #ededed',
                    borderRight: '1px solid #ededed',
                },
                '& th:last-of-type, & td:last-of-type': {
                    borderRight: 0,
                },
                '& tr:nth-of-type(even)': {
                    backgroundColor: '#fafafa',
                },
                '& th::before': {
                    position: 'absolute',
                    right: '15px',
                    top: '16px',
                    content: '""',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                },
                '& th.sort-asc::before': {
                    borderBottom: '5px solid #22543d',
                },
                '& th.sort-desc::before': {
                    borderTop: '5px solid #22543d',
                },
            },
            '.badge': {
                backgroundColor: '#9ae6b4',
                color: '#22543d',
                marginRight: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
            },
            input: {
                padding: '10px',
                marginBottom: '20px',
                fontSize: '18px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                boxShadow: 'none',
            },
            '.header': {
                position: 'absolute',
                width: '100%',
                height: '56px',
                left: 0,
                top: 0,
                backgroundColor: '#3d8fc9',
            },
            '.flex-left, .flex-horizontal': {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            },
            '.flex-horizontal-s-b': {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            '.container': {
                padding: '0 13px 13px 13px',
            },
            '.existing': {
                color: 'black',
                fontWeight: 'bold',
            },
            '.mock': {
                color: 'grey',
                fontStyle: 'italic',
            },
            '.tableStyle': {
                width: '100%',
            },
            '.square': {
                width: '100%',
                position: 'relative',
                borderColor: '#5a5a5a',
            },
            '.groove': {
                borderStyle: 'groove',
                width: 'inherit',
            },
            '.under': {
                textDecoration: 'underline',
            },
            '.tabBtn *': {
                width: '100%',
            },
            '@keyframes highlight': {
                '0%': { backgroundColor: '#b37775' },
                '50%': { backgroundColor: '#92514f !important' },
                '100%': { backgroundColor: 'initial' },
            },
        }}
    />
);

export { theme, GlobalStyleOverrides };
