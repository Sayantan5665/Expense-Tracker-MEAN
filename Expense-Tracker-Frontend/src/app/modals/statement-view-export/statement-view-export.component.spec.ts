import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementViewExportComponent } from './statement-view-export.component';

describe('StatementViewExportComponent', () => {
  let component: StatementViewExportComponent;
  let fixture: ComponentFixture<StatementViewExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatementViewExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatementViewExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
