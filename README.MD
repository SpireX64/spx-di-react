# SPX-DI-REACT
SPX-DI library integration with React

Adds `useDI` hook and `withDI` HOC
for dependency injection in React components.

Preserves strong typing while matching
property types and injected instance types.

## Installation
You can install using any NPM package manager:
```shell
> npm i spx-di-react
> yarn add spx-di-react
> pnpm add spx-di-react
```

## Integration

### 1. Create DI Context with Container's TypeMap
The context is created using the `createDIContext` function.
All it needs is to provide the `TypeMap` of the container,
so that the context is aware of the types that can be provided.

Since `TypeMap` can change as the container is configured, its final version can be obtained
using the `TypeMapOfContainer` tool type, which is included in 'spx-di'.

As a result of `createDIContext` execution,
will return a typed object containing:
- `DIContextProvider` - The context provider that is used to pass the container through the virtual tree.
- `useDI` - React-hook, which provides dependencies to functional components;
- `withDI` - React-HOC, a wrapper that exposes dependencies through component properties.

Don't forget to export them for access from other parts of the application.

```ts
export function buildContainer() {
    return DIContainer.builder()
        .build()
} 

type TAppContainerTypeMap = TypeMapOfContainer<ReturnType<typeof buildContainer>>

export const {
    DIContextProvider,
    useDI,
    withDI,
} = createDIContext<TAppContainerTypeMap>()
```

### 2. Wrap app component in DIContainer
To allow components to access the container via `useDI` and `withDI`,
you need to provide it with `DIContextProvider`.

It requires the container itself to be passed to its property:
```tsx
import {useMemo} from "react";

const RootComponent = () => {
    const container = useMemo(buildContainer, [])
    return (
        <DIContextProvider container={container}>
            <AppComponent/>
        </DIContextProvider>
    )
}
```

### Getting dependencies by useDI
Using `useDI` is the easiest way to get dependencies in components.
It only requires you to pass a function that will do the getting.
necessary dependencies from the container.

```tsx
import {useMemo} from "react";

const MyComponent = () => {
    const {appManager, accessManager} = useDI(r => ({
        appManager: r.get(Types.AppManager),
        accessManager: r.get(Types.AccessManager),
    }))

    const premium = useMemo(() => accessManager.hasPremium, [])

    return (
        <View>
            {/* .... */}
        </View>
    )
}
```

### Getting dependencies by withDI HOC
Similarly, you can get dependencies by `withDI`.
It takes the same function.
But the difference is that the fields of the returned object
must match the names of the properties of the component
to which the dependencies are provided.

```tsx
type MyComponentProps = {
    name: string
    appManager: AppManager
    accessManager: AccessManager
}

const MyComponent = ({
    name,
    appManager,
    accessManager,
}: MyComponentProps) => {
    return (
        <View>{name}</View>
    )
}

export default withDI(r => ({
    appManager: AppManager,
    accessManager: AccessManager,
}))(MyComponent)
```
