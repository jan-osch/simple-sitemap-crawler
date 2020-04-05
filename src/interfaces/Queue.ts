export interface Queue<T> {
  getNextTask(): Promise<T>;

  addTask(task: T): Promise<void>;
}
