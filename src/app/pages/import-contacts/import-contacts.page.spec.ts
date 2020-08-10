import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportContactsPage } from './import-contacts.page';

describe('ImportContactsPage', () => {
  let component: ImportContactsPage;
  let fixture: ComponentFixture<ImportContactsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportContactsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportContactsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
