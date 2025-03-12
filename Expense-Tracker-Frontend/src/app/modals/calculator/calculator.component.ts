import { DOCUMENT, NgStyle } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { evaluate, format } from 'mathjs';

@Component({
  selector: 'app-calculator',
  imports: [MatDialogModule, FormsModule, MatIcon, NgStyle],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CalculatorComponent>);
  readonly data: { element: HTMLElement } = inject(MAT_DIALOG_DATA);
  private readonly document = inject(DOCUMENT);

  protected currentInput = signal<string>('');
  protected result = signal<string>('');


  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig()
    const rect: DOMRect = this.data.element.getBoundingClientRect();

    matDialogConfig.position = { right: `10px`, top: `${(rect.bottom < 0 ? 10 : rect.bottom) + 2}px` }
    this.dialogRef.updatePosition(matDialogConfig.position)
  }

  appendValue(value: string, inputElement: HTMLElement): void {
    const _currentInput = this.currentInput();
    if (!(value === '.' && (_currentInput as any).split(/[\+\-\*\%\/]/).pop().includes('.'))) {
      this.currentInput.update((data) => data + value);
    }

    if (this.result().length) {
      // Check the last character before appending the new value
      const lastChar = this.currentInput().slice(-1); // last character
      if (/\d|%/.test(lastChar)) {
        this.calculate();
      }
    }
    inputElement.focus();
  }

  clear(type: 'single' | 'all', inputElement: HTMLElement) {
    if (type === 'single') {
      this.currentInput.update((data) => data.slice(0, -1));
    } else if (type === 'all') {
      this.currentInput.set('');
      this.result.set('');
    }
    inputElement.focus();
  }

  protected calculate() {
    const _currentInput = this.currentInput();
    try {
      let _result = evaluate(_currentInput).toString() || '';
      // _result.length > 13 && (_result = format(Number(_result), { notation: 'exponential', precision: 2 }));

      const resultEle = this.document.getElementById('resultElement');
      if (resultEle) {
        if (_result.length > 13 && _result.length < 18) {
          resultEle.style.fontSize = "2rem";
        } else if (_result.length >= 18) {
          resultEle.style.fontSize = "1.6rem";
        }
      }

      this.result.set(_result);
    } catch (error) {
      this.result.set('Error');
    }
  }

  protected numbersOnly(event: any) {
    const key = event.key;
    const allowedKeys = ['*', '/', '+', '-', '%', 'Backspace', 'ArrowRight', 'ArrowLeft'];

    if (/[0-9.]/.test(key) || allowedKeys.includes(key)) {
      const display: any = event.target as HTMLInputElement;
      if (key === '.' && (display.value).split(/[\+\-\*\%\/]/).pop().includes('.')) {
        return false;
      }
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
}
