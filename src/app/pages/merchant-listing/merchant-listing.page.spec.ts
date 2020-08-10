import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantListingPage } from './merchant-listing.page';

describe('MerchantListingPage', () => {
  let component: MerchantListingPage;
  let fixture: ComponentFixture<MerchantListingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantListingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
