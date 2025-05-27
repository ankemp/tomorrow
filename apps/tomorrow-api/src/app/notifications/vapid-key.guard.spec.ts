import { ExecutionContext, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { VapidKeyGuard } from './vapid-key.guard';

describe('VapidKeyGuard', () => {
  let guard: VapidKeyGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VapidKeyGuard],
    }).compile();

    guard = module.get<VapidKeyGuard>(VapidKeyGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if VAPID_KEY is set', () => {
    process.env.VAPID_KEY = 'test_key';
    const mockContext = {} as ExecutionContext;
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw an exception if VAPID_KEY is not set', () => {
    delete process.env.VAPID_KEY;
    const mockContext = {} as ExecutionContext;
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
  });
});
