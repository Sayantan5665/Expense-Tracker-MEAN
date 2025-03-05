import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseViewEditComponent } from './expense-view-edit.component';

describe('ExpenseViewEditComponent', () => {
  let component: ExpenseViewEditComponent;
  let fixture: ComponentFixture<ExpenseViewEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseViewEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseViewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
