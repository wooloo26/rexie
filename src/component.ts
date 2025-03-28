import { normalizeChildren } from './h'
import { resetHookIndex } from './hooks'
import { createNode } from './pixijs'
import { IntrinsicAttributes, Children, Fiber, FiberFC, FiberHost } from './fiber'
import { reconcileChildren } from './reconcile'

export interface ExternalFC<P = IntrinsicAttributes> extends Omit<FC<P>, 'id'> {
    (props: P & IntrinsicAttributes): Fiber
}
export interface FC<P = IntrinsicAttributes> {
    (props: P & IntrinsicAttributes): Children
    id: string
    memo?: boolean
    shouldUpdate?: (newProps: P, oldProps: P) => boolean
}

let currentFC: Fiber | undefined = undefined
export const setCurrentFC = (fiber?: Fiber) => (currentFC = fiber)

/**
 * Retrieves the current function component (FC).
 *
 * @throws Throws an error if the current function component is not set.
 */
export function getCurrentFC() {
    if (!currentFC) {
        throw new Error('Invalid hook call')
    }

    return currentFC
}

export function updateComponent(fiber: Fiber) {
    fiber.root = findRoot(fiber)
    if (__DEV__ && !fiber.root) {
        throw new Error('Not found the root.')
    }

    if (fiber.fc) {
        updateFC(fiber)
    } else {
        updateHost(fiber)
    }
}

function findRoot(fiber: Fiber) {
    let parent = fiber
    while (parent) {
        if (parent.root) {
            return parent.root
        }

        if (parent.parent) {
            parent = parent.parent
        } else {
            return parent.root
        }
    }
}

function updateFC(fiber: FiberFC) {
    resetHookIndex()
    setCurrentFC(fiber)
    fiber.child = reconcileChildren(fiber, normalizeChildren((fiber.type as FC)(fiber.props)))
}

export function isMemoizedComponent(fiber: Fiber) {
    if (fiber.fc && fiber.type.memo && fiber.type === fiber.old?.type && fiber.old.props) {
        const shouldUpdate = fiber.type.shouldUpdate || havePropsChanged
        if (!shouldUpdate(fiber.props, fiber.old.props)) {
            return true
        }
    }
    return false
}

function havePropsChanged(a: Record<string, unknown>, b: Record<string, unknown>) {
    for (const k in a) {
        if (!(k in b)) {
            return true
        }
    }
    for (const k in b) {
        if (a[k] !== b[k]) {
            return true
        }
    }
}

function updateHost(fiber: FiberHost) {
    fiber.parentNode = findClosestHostParentNode(fiber)
    if (__DEV__ && !fiber.parentNode) {
        throw new Error('Not found the root node.')
    }
    if (!fiber.node) {
        fiber.node = createNode(fiber)
    }
    fiber.child = reconcileChildren(fiber, fiber.props.children || [])
}

function findClosestHostParentNode(fiber: FiberHost) {
    let parent = fiber?.parent
    while (parent) {
        if (!parent.fc) {
            return parent.node
        }

        if (parent.parent) {
            parent = parent.parent
        } else {
            return parent.root?.node
        }
    }
}
