import { Subject } from 'rxjs';

interface FeedEvent {
  title?: string;
  content: string;
  [key: string]: any;
}

class FeedBus {
  private feedSubject = new Subject<FeedEvent>();

  getStream(): Subject<FeedEvent> {
    return this.feedSubject;
  }

  broadcast(event: string, data: FeedEvent): void {
    this.feedSubject.next(data);
  }
}

export const feedBus = new FeedBus();
