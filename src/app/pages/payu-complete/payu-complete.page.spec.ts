import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayuCompletePage } from './payu-complete.page';

describe('PayuCompletePage', () => {
  let component: PayuCompletePage;
  let fixture: ComponentFixture<PayuCompletePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayuCompletePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayuCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
