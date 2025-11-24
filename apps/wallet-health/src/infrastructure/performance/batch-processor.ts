/**
 * Batch Processor
 */

export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private processFn: (batch: T[]) => Promise<void>;

  constructor(batchSize: number, processFn: (batch: T[]) => Promise<void>) {
    this.batchSize = batchSize;
    this.processFn = processFn;
  }

  async add(item: T): Promise<void> {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize && !this.processing) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processFn(batch);
    } finally {
      this.processing = false;
    }
  }
}


