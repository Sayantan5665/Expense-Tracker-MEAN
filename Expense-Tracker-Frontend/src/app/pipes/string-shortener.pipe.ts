import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringShortener'
})
export class StringShortenerPipe implements PipeTransform {

  transform(value: string, length: number): unknown {
    let finalString:string = value.trim();
    if (value.length > length) {
      const nameFirstHalf = finalString.slice(0, length/2).trim();
      const nameLastHalf = finalString.slice(-(length/2)).trim();
      finalString = nameFirstHalf + '...' + nameLastHalf;
    }
    return finalString;
  }

}
