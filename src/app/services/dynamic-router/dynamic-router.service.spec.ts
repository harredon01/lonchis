import { TestBed } from '@angular/core/testing';

import { DynamicRouterService } from './dynamic-router.service';

describe('DynamicRouterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicRouterService = TestBed.get(DynamicRouterService);
    expect(service).toBeTruthy();
  });
});
