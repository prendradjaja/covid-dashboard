import { TestBed } from '@angular/core/testing';

import { GraphConfigurationService } from './graph-configuration.service';

describe('GraphConfiguration', () => {
  let service: GraphConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
