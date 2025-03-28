import { h } from './h'
import { useEffect } from './hooks'
import { Children, ExternalPropsOf, Fiber } from './fiber'
import { createContext, useContext } from './context'
import { ExternalFC } from './component'
import { useTransition } from './hooks/useTransition'

interface SuspenseProps {
    fallback?: Children
    children?: Children
}

const SuspenseContenxt = createContext<Children>(null)

export function Suspense(props: SuspenseProps) {
    return h(SuspenseContenxt.Provider, { value: props.fallback }, props.children)
}

export function lazy<T extends ExternalFC>(load: () => Promise<{ default: T }>) {
    let error: unknown
    let component: undefined | ExternalFC

    return (props: ExternalPropsOf<T>) => {
        const fallback = useContext(SuspenseContenxt)
        const [, startTransition] = useTransition()

        useEffect(() => {
            startTransition(async () => {
                try {
                    const module = await load()
                    component = module.default
                } catch (e) {
                    error = e
                }
            })
        }, [])

        if (error) throw error
        if (component) return component(props)
        return fallback as Fiber
    }
}
