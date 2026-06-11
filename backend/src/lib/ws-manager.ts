import type { WSContext } from "hono/ws";

export type WSMessage = {
  type: string;
  data: unknown;
};

export class WebSocketManager {
  private clients: Map<string, Set<WSContext>> = new Map();

  addClient(userId: string, ws: WSContext): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);
  }

  removeClient(userId: string, ws: WSContext): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;
    userClients.delete(ws);
    if (userClients.size === 0) {
      this.clients.delete(userId);
    }
  }

  sendToUser(userId: string, message: WSMessage): void {
    const userClients = this.clients.get(userId);
    if (!userClients) {
      console.warn(`[WS] sendToUser: no clients for user ${userId}`);
      return;
    }
    const data = JSON.stringify(message);
    userClients.forEach((ws) => this.safeSend(userId, ws, data));
  }

  broadcast(message: WSMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach((userClients, userId) => {
      userClients.forEach((ws) => this.safeSend(userId, ws, data));
    });
  }

  get clientCount(): number {
    let count = 0;
    this.clients.forEach((s) => (count += s.size));
    return count;
  }

  getConnectedUserIds(): string[] {
    return [...this.clients.keys()];
  }

  private safeSend(userId: string, ws: WSContext, data: string): void {
    try {
      ws.send(data);
    } catch (error) {
      console.error(`[WS] Send failed for user ${userId}:`, error);
      this.removeClient(userId, ws);
    }
  }
}
