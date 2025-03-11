export type Ref<T = any> = RefObject<T> | RefCallback<T>
export type RefObject<T> = { current: T }
export type RefCallback<T> = (instance: T) => any
