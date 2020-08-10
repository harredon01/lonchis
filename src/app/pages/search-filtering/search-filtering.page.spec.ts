import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilteringPage } from './search-filtering.page';

describe('SearchFilteringPage', () => {
  let component: SearchFilteringPage;
  let fixture: ComponentFixture<SearchFilteringPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFilteringPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilteringPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
