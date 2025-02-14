import express from 'express';

const sseClients = new Map<string, express.Response[]>();

export function notifyUser(userId: string, event: string, data: object) {
  (sseClients.get(userId) || []).forEach((res) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export function addSseClient(userId: string, res: express.Response) {
  const clients = sseClients.get(userId) || [];
  clients.push(res);
  sseClients.set(userId, clients);
}

export function removeSseClient(userId: string, res: express.Response) {
  const clients = sseClients.get(userId) || [];
  sseClients.set(
    userId,
    clients.filter((r) => r !== res),
  );
}
