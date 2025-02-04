import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { evaluate, format } from 'mathjs';

@Component({
  selector: 'app-calculator',
  imports: [MatDialogModule, FormsModule, MatIcon],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CalculatorComponent>);
  readonly data: { element: HTMLElement } = inject(MAT_DIALOG_DATA);

  protected currentInput = signal<string>('');
  protected result = signal<string>('');


  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig()
    const rect: DOMRect = this.data.element.getBoundingClientRect();
    console.log("rect: ", rect);

    matDialogConfig.position = { right: `10px`, top: `${rect.bottom + 2}px` }
    this.dialogRef.updatePosition(matDialogConfig.position)
  }

  appendValue(value: string) {
    this.currentInput.update((data) => data + value);

    if (this.result().length) {
      // Check the last character before appending the new value
      const lastChar = this.currentInput().slice(-1); // Second last character
      if (/\d|%/.test(lastChar)) {
        this.calculate();
      }
    }
  }

  clear(type: 'single' | 'all') {
    if (type === 'single') {
      this.currentInput.update((data) => data.slice(0, -1));
    } else if (type === 'all') {
      this.currentInput.set('');
      this.result.set('');
    }
  }

  protected calculate() {
    const _currentInput = this.currentInput();
    try {
      let _result = evaluate(_currentInput).toString() || '';
      _result.length > 13 && (_result = format(Number(_result), {notation: 'exponential', precision: 2}));
      this.result.set(_result);
    } catch (error) {
      this.result.set('Error');
    }
  }
}
