import MemoryQueue from "./MemoryQueue";

describe("MemoryQueue", () => {
  test("if one task is added, it should be returned on getNextTask()", async () => {
    const q = new MemoryQueue();
    const expected = "A";

    await q.addTask(expected);
    const actual = await q.getNextTask();

    expect(actual).toEqual(expected);
  });

  test("if multiple tasks are added, they should be returned in the order of insertion", async () => {
    const tasks = ["A", "B", "C", "D"];
    const q = new MemoryQueue<string>();

    for (const task of tasks) {
      await q.addTask(task);
    }
    const actual: string[] = [];
    while (actual.length !== tasks.length) {
      actual.push(await q.getNextTask());
    }

    expect(actual).toEqual(tasks);
  });

  test("if no are in queue tasks, getNextTask append a handler for execution on task add", async () => {
    const q = new MemoryQueue<string>();
    const expectedOrder = ["first", "second", "third"];
    const actualOrder: string[] = [];

    expectedOrder.forEach((order) => {
      q.getNextTask().then(() => actualOrder.push(order));
    });

    while (actualOrder.length !== expectedOrder.length) {
      await q.addTask("A");
    }

    expect(expectedOrder).toEqual(actualOrder);
  });
});
