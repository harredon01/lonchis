import { TestBed } from '@angular/core/testing';

import { MerchantsService } from './merchants.service';

describe('MerchantsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MerchantsService = TestBed.get(MerchantsService);
    expect(service).toBeTruthy();
  });
});
