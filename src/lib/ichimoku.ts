import { Indicator, IndicatorInput } from './indicator';
import { CandleData } from './types';
import LinkedList from './util/fixedsize-linked-list';

export class IchimokuCloudInput extends IndicatorInput {
  high: number[] = [];
  low: number[] = [];
  conversionPeriod?: number = 9;
  basePeriod?: number = 26;
  spanPeriod?: number = 52;
  displacement?: number = 26;
}

export class IchimokuCloudOutput {
  conversion: number = 0;
  base: number = 0;
  spanA: number = 0;
  spanB: number = 0;
}

export class IchimokuCloud extends Indicator {
  // result: IchimokuCloudOutput[];
  // generator: IterableIterator<IchimokuCloudOutput | undefined>;
  static calculate(input: IchimokuCloudInput) {
    this.reverseInputs(input);
    const results: IchimokuCloudOutput[] = [];
    const defaults = {
      conversionPeriod: 9,
      basePeriod: 30,
      spanPeriod: 52,
      displacement: 26,
    };

    const params = (Object as any).assign({}, defaults, input);

    const currentConversionData = new LinkedList(params.conversionPeriod * 2, true, true, false);
    const currentBaseData = new LinkedList(params.basePeriod * 2, true, true, false);
    const currenSpanData = new LinkedList(params.spanPeriod * 2, true, true, false);

    const period = Math.max(params.conversionPeriod, params.basePeriod, params.spanPeriod, params.displacement);

    let periodCounter = 1;
    for (const [index, low] of input.low.entries()) {
      const tick: CandleData = {
        high: input.high[index],
        low,
      };

      // Keep a list of lows/highs for the max period
      currentConversionData.push(tick.high);
      currentConversionData.push(tick.low);
      currentBaseData.push(tick.high);
      currentBaseData.push(tick.low);
      currenSpanData.push(tick.high);
      currenSpanData.push(tick.low);

      if (periodCounter < period) {
        periodCounter++;
      } else {
        // Tenkan-sen (ConversionLine): (9-period high + 9-period low)/2))
        let conversionLine = (currentConversionData.periodHigh + currentConversionData.periodLow) / 2;

        // Kijun-sen (Base Line): (26-period high + 26-period low)/2))
        let baseLine = (currentBaseData.periodHigh + currentBaseData.periodLow) / 2;

        // Senkou Span A (Leading Span A): (Conversion Line + Base Line)/2))
        let spanA = (conversionLine + baseLine) / 2;

        // Senkou Span B (Leading Span B): (52-period high + 52-period low)/2))
        let spanB = (currenSpanData.periodHigh + currenSpanData.periodLow) / 2;

        // Senkou Span A / Senkou Span B offset by 26 periods
        // if(spanCounter < params.displacement) {
        // 	spanCounter++
        // } else {
        // 	spanA = spanAs.shift()
        // 	spanB = spanBs.shift()
        // }

        const result: IchimokuCloudOutput = {
          conversion: conversionLine,
          base: baseLine,
          spanA: spanA,
          spanB: spanB,
        };
        results.push(result);
      }
    }
    return results;
  }
}
