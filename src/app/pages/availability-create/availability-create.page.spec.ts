import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityCreatePage } from './availability-create.page';

describe('AvailabilityCreatePage', () => {
  let component: AvailabilityCreatePage;
  let fixture: ComponentFixture<AvailabilityCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailabilityCreatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilityCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
