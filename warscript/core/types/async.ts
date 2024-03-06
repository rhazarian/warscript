import { Handle } from "./handle"

export type Async<T extends Handle<any>> = Readonly<T>
