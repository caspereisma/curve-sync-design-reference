interface ColorPalette {
    [key: number | string]: string;
}

const GREY = {
    900: '#1F1F21',
    800: '#404041',
    700: '#5F5F60',
    600: '#737374',
    500: '#9B9B9D',
    400: '#BBBBBD',
    300: '#DEDEE0',
    200: '#ECECEE',
    150: '#E2E2E2',
    100: '#F4F4F6',
    50: '#FAFAFC',
} as const satisfies ColorPalette;

const ORANGE = {
    900: '#EA4B04',
    800: '#F36703',
    700: '#F97802',
    600: '#FF8800',
    500: '#FF9400',
    400: '#FFA424',
    300: '#FFB44C',
    200: '#FFCA7F',
    100: '#FFDFB1',
    50: '#FFF3E0',
} as const satisfies ColorPalette;

const YELLOW = {
    900: '#F8810C',
    800: '#FBAA1C',
    700: '#FCC326',
    600: '#FEDB2F',
    500: '#FCEC32',
    400: '#FFF155',
    300: '#FDF172',
    200: '#FEF69B',
    100: '#FFFAC3',
    50: '#FFFDE7',
} as const satisfies ColorPalette;

const FUGA_GREEN = {
    900: '#00941C',
    800: '#00B92A',
    700: '#00CF32',
    600: '#00E53C',
    500: '#24F745',
    400: '#50FC5D',
    300: '#80FF80',
    200: '#ACFFA8',
    100: '#CFFFCB',
    50: '#f8fdfa',
} as const satisfies ColorPalette;

const GREEN = {
    900: '#006218',
    800: '#00812C',
    700: '#009237',
    600: '#00A542',
    500: '#00B44C',
    400: '#0FC066',
    300: '#56CC82',
    200: '#8DDAA6',
    100: '#BBE9C9',
    50: '#E3F6E9',
} as const satisfies ColorPalette;

const TURQUOISE = {
    900: '#006C4C',
    800: '#008969',
    700: '#009A78',
    600: '#00AC89',
    500: '#00BA97',
    400: '#00C7A7',
    300: '#13D4B8',
    200: '#60E4CD',
    100: '#9CF0E1',
    50: '#D8F9F4',
} as const satisfies ColorPalette;

const BLUE = {
    900: '#295E95',
    800: '#377EB6',
    700: '#3D8FC9',
    600: '#45A2DD',
    500: '#4AB0EC',
    400: '#5ABCED',
    300: '#74C7ED',
    200: '#97D7F2',
    100: '#BDE7F7',
    50: '#E5F6FC',
} as const satisfies ColorPalette;

const FUGA_BLUE = {
    900: '#202E54',
    800: '#293E6C',
    700: '#304879',
    600: '#385285',
    500: '#3F598E',
    400: '#5C719C',
    300: '#788AAD',
    200: '#9DABC5',
    100: '#C3CCDC',
    50: '#E8EBF0',
} as const satisfies ColorPalette;

const NAXOS_BLUE = {
    950: '#202E54',
    900: '#0060A9',
    800: '#0080CB',
    700: '#0092DF',
    600: '#00A5F3',
    500: '#00B4FF',
    400: '#28C0FF',
    300: '#50CBFF',
    200: '#83DAFF',
    100: '#B5E9FF',
    50: '#E2F7FF',
} as const satisfies ColorPalette;

const PURPLE = {
    900: '#371678',
    800: '#482286',
    700: '#52288E',
    600: '#5E3097',
    500: '#66359D',
    400: '#7C52AB',
    300: '#9270BA',
    200: '#B099CD',
    100: '#CFC2E1',
    50: '#ECE6F3',
} as const satisfies ColorPalette;

const RED = {
    900: '#B7191F',
    800: '#C6262B',
    700: '#D32D32',
    600: '#E53738',
    500: '#F44139',
    400: '#EF5252',
    300: '#E47375',
    200: '#EE9A9B',
    100: '#FECDD3',
    50: '#FFEBEE',
} as const satisfies ColorPalette;

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const BLACK_TITLE = '#00000099';

interface FugaColorsType {
    GREY: typeof GREY;
    ORANGE: typeof ORANGE;
    YELLOW: typeof YELLOW;
    FUGA_GREEN: typeof FUGA_GREEN;
    GREEN: typeof GREEN;
    TURQUOISE: typeof TURQUOISE;
    BLUE: typeof BLUE;
    FUGA_BLUE: typeof FUGA_BLUE;
    NAXOS_BLUE: typeof NAXOS_BLUE;
    PURPLE: typeof PURPLE;
    RED: typeof RED;
    WHITE: string;
    BLACK: string;
    BLACK_TITLE: string;
}

export const FUGA_COLORS: FugaColorsType = {
    GREY,
    ORANGE,
    YELLOW,
    FUGA_GREEN,
    GREEN,
    TURQUOISE,
    BLUE,
    FUGA_BLUE,
    NAXOS_BLUE,
    PURPLE,
    RED,
    WHITE,
    BLACK,
    BLACK_TITLE,
} as const;

interface FugaPaletteType {
    purple: typeof FUGA_COLORS.PURPLE;
    grey: typeof FUGA_COLORS.GREY;
    orange: typeof FUGA_COLORS.ORANGE;
    yellow: typeof FUGA_COLORS.YELLOW;
    fugaGreen: typeof FUGA_COLORS.FUGA_GREEN;
    green: typeof FUGA_COLORS.GREEN;
    turquoise: typeof FUGA_COLORS.TURQUOISE;
    blue: typeof FUGA_COLORS.BLUE;
    fugaBlue: typeof FUGA_COLORS.FUGA_BLUE;
    naxosBlue: typeof FUGA_COLORS.NAXOS_BLUE;
    red: typeof FUGA_COLORS.RED;
}

export const fugaPalette: FugaPaletteType = {
    purple: FUGA_COLORS.PURPLE,
    grey: FUGA_COLORS.GREY,
    orange: FUGA_COLORS.ORANGE,
    yellow: FUGA_COLORS.YELLOW,
    fugaGreen: FUGA_COLORS.FUGA_GREEN,
    green: FUGA_COLORS.GREEN,
    turquoise: FUGA_COLORS.TURQUOISE,
    blue: FUGA_COLORS.BLUE,
    fugaBlue: FUGA_COLORS.FUGA_BLUE,
    naxosBlue: FUGA_COLORS.NAXOS_BLUE,
    red: FUGA_COLORS.RED,
};
