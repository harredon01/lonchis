import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilitiesPage } from './availabilities.page';

describe('AvailabilitiesPage', () => {
  let component: AvailabilitiesPage;
  let fixture: ComponentFixture<AvailabilitiesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailabilitiesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
