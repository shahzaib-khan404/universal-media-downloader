import { EventEmitter } from 'events';

const emitter = new EventEmitter();
emitter.setMaxListeners(200); // one per active SSE client

export interface JobEvent {
  id: string;
  status: string;
  progress: number;
  speed: string | null;
  eta: string | null;
  error: string | null;
}

export function emitJobUpdate(event: JobEvent) {
  emitter.emit(`job:${event.id}`, event);
}

export function subscribeToJob(jobId: string, handler: (event: JobEvent) => void): () => void {
  emitter.on(`job:${jobId}`, handler);
  return () => emitter.off(`job:${jobId}`, handler);
}
