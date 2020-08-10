import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPreparePage } from './checkout-prepare.page';

describe('CheckoutPreparePage', () => {
  let component: CheckoutPreparePage;
  let fixture: ComponentFixture<CheckoutPreparePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutPreparePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutPreparePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
