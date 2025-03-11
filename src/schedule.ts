export type Action = (() => Action) | Promise<Action> | void

export interface Task {
    next: Action
    wait?: boolean
    onResolved?: () => void
}

let deadline = 0
let useMicrotask = false
const taskQueue: Task[] = []
const TASK_YIELD_THRESHOLD_MS = 5

/**
 * Non-urgent update (transitional update):
 * For example, search suggestions, data loading, etc., which can be processed later.
 * Marks the wrapped update as non-urgent, and the action will be executed after the UI update.
 */
export function startTransition(action: () => void | Promise<void>) {
    schedule(action)
}

export function schedule(action: Action, onResolved?: () => void) {
    const task = { next: action, onResolved } as Task
    taskQueue.push(task)
    scheduleWork(processTaskQueue)
    return () => removeTask(task)
}

function processTaskQueue() {
    deadline = performance.now() + TASK_YIELD_THRESHOLD_MS

    while (firstTask() && !shouldYield()) {
        const task = firstTask()
        if (task.next instanceof Promise) {
            taskQueue.shift()
            taskQueue.push(task)
            processAsyncAction(task, task.next)
        } else if (task.next) {
            const next = task.next?.()
            if (next) {
                task.next = next
            } else {
                resolveFirstTask()
            }
        } else {
            resolveFirstTask()
        }
    }

    if (firstTask()) {
        useMicrotask = !shouldYield()
        scheduleWork(processTaskQueue)
    }
}

/**
 * Determines if the current task should yield control back to the main thread.
 * This function compares the current time with a predefined deadline.
 */
export const shouldYield = () => performance.now() >= deadline

function processAsyncAction(task: Task, action: Promise<Action>) {
    if (task.wait) return
    task.wait = true

    action
        .then(next => {
            if (next) {
                task.next = next
            } else {
                resolveAsyncTask(task)
            }
        })
        .catch(err => {
            resolveAsyncTask(task)

            if (__DEV__) {
                console.error(err)
            }
        })
}

function resolveAsyncTask(task: Task) {
    const first = firstTask()
    if (first === task) {
        resolveFirstTask()
    } else {
        removeTask(task, () => {
            task.next = undefined
            task.wait = undefined
            first.onResolved = () => {
                first.onResolved?.()
                task.onResolved?.()
            }
        })
    }
}

const firstTask = () => taskQueue[0]

function resolveFirstTask() {
    const task = taskQueue.shift()
    if (task) {
        task.next = undefined
        task.onResolved?.()
    }
}

function removeTask(task: Task, after?: () => void) {
    const index = taskQueue.findIndex(t => t === task)
    if (index > -1) {
        taskQueue.splice(index, 1)
        after?.()
    }
}

function scheduleWork(work: () => void) {
    if (useMicrotask && typeof queueMicrotask !== 'undefined')
        queueMicrotask(work)
    else if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel()
        port1.onmessage = work
        port2.postMessage(null)
    } else setTimeout(work)
}
