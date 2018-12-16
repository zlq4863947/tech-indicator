import { Indicator, IndicatorInput } from './indicator';
import { LinkedList } from './util/linked-list';

export class MAInput extends IndicatorInput {
  constructor(public period: number, public values: number[]) {
    super();
  }
}

export class SMA extends Indicator {
  static calculate(input: MAInput) {
    this.reverseInputs(input);
    const period = input.period;
    const priceList = input.values;
    const list = new LinkedList();
    const results = [];
    let sum = 0;
    let counter = 1;
    list.push(0);

    for (const price of priceList) {
      if (counter < period) {
        counter++;
        sum = sum + price;
      } else {
        sum = sum - list.shift() + price;
        const result = sum / period;
        results.push(result);
      }
      list.push(price);
    }
    return results;
  }
}
