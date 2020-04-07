import { TestBed } from '@angular/core/testing';

import { NytFetcherService } from './nyt-fetcher.service';

describe('NytFetcherService', () => {
  let service: NytFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NytFetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
