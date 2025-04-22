import {
  createServiceFactory,
  SpectatorService,
} from '@ngneat/spectator/vitest';
import { SubtaskGenerationService } from './subtask-generation.service';

describe('SubtaskGenerationService', () => {
  let spectator: SpectatorService<SubtaskGenerationService>;
  const createService = createServiceFactory(SubtaskGenerationService);

  beforeEach(() => (spectator = createService()));

  it('should...', () => {
    expect(spectator.service).toBeTruthy();
  });
});
