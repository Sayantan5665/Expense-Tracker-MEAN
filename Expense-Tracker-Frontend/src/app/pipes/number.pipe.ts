import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'number'
})
export class NumberPipe implements PipeTransform {

  transform(numbers: string | number, decimalDigits: number = 2): string {
    // Thousand(K), Million(M), Billion(B), Trillion(T), Peta(P), Exa(E)
    const num = Number(numbers);
    const si = [
      { value: 1, symbol: '' },
      { value: 1E3, symbol: 'K' },
      { value: 1E6, symbol: 'M' },
      { value: 1E9, symbol: 'B' },
      { value: 1E12, symbol: 'T' },
      { value: 1E15, symbol: 'P' },
      { value: 1E18, symbol: 'E' }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(decimalDigits).replace(rx, '$1') + si[i].symbol;
  }

  roundDown(number: number) {
    const decimals = 0
    return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals));
  }

}
