import { TestBed } from '@angular/core/testing';

import { CdsFetcherService } from './cds-fetcher.service';

describe('CdsFetcherService', () => {
  let service: CdsFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdsFetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
