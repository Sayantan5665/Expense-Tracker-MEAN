import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-default',
  imports: [MatDialogModule],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss'
})
export class DefaultComponent {
  // protected data: { type: string, [x: string]: any } = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DefaultComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  constructor() {
    console.log("data: ", this.data);
  }

  public closeModal(): void {
    this.dialogRef.close();
  }
}
