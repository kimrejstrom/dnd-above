export interface Options {
    maxRollTimes?: number;
    maxDiceSides?: number;
    maxExplode?: number;
    renderExpressionDecorators?: boolean;
    decorators?: {
        reroll?: string | string[];
        explode?: string | string[];
        drop?: string | string[];
        critical?: string | string[];
        success?: string | string[];
    };
}
