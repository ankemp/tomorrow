import { randomUUID } from 'crypto';
import { Response } from 'express';

const sseClients = new Map<string, Map<string, Response>>();

export function dispatchServerSideEvent<T>(
  userId: string,
  originatingDeviceId: string,
  event: string,
  data: T,
) {
  const userClients = sseClients.get(userId) || new Map();
  userClients.forEach((res, deviceId) => {
    if (deviceId !== originatingDeviceId) {
      res.write('id: ' + randomUUID() + '\n');
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}

export function addSseClient(userId: string, deviceId: string, res: Response) {
  const userClients = sseClients.get(userId) || new Map();
  userClients.set(deviceId, res);
  sseClients.set(userId, userClients);
}

export function removeSseClient(userId: string, deviceId: string) {
  const userClients = sseClients.get(userId) || new Map();
  userClients.delete(deviceId);
  if (userClients.size === 0) {
    sseClients.delete(userId);
  } else {
    sseClients.set(userId, userClients);
  }
}
