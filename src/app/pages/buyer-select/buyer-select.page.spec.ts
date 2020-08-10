import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerSelectPage } from './buyer-select.page';

describe('BuyerSelectPage', () => {
  let component: BuyerSelectPage;
  let fixture: ComponentFixture<BuyerSelectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerSelectPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
