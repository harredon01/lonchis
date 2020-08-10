import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalPage } from './medical.page';

describe('MedicalPage', () => {
  let component: MedicalPage;
  let fixture: ComponentFixture<MedicalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
