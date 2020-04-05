import { Queue } from "../interfaces/Queue";

type CallbackType<T> = (t: T) => any;

class MemoryQueue<T> implements Queue<T> {
  private queue: T[];
  private callbacks: CallbackType<T>[];

  constructor() {
    this.queue = [];
    this.callbacks = [];
  }

  async addTask(task: T): Promise<void> {
    const callback = this.callbacks.shift();
    if (callback) {
      callback(task);
    } else {
      this.queue.push(task);
    }
  }

  getNextTask(): Promise<T> {
    const task = this.queue.shift();
    if (task) {
      return Promise.resolve(task);
    }

    return new Promise((resolve) => {
      this.callbacks.push(resolve);
    });
  }
}

export default MemoryQueue;
