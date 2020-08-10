import { TestBed } from '@angular/core/testing';

import { MercadoPagoService } from './mercado-pago.service';

describe('MercadoPagoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MercadoPagoService = TestBed.get(MercadoPagoService);
    expect(service).toBeTruthy();
  });
});
