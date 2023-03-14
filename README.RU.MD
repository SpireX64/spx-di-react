# SPX-DI-REACT
Интеграция библиотеки SPX-DI с React

Добавляет `useDI` хук и `withDI` КВП
для инъекции зависимостей в React-компоненты.

Сохраняет строгую типизацию, проверяя соответствие
типов свойств и типов внедряемых экземпляров

## Установка
Установить можно с помощью любого менеджера NPM-пакетов:
```shell
> npm i spx-di-react
> yarn add spx-di-react
> pnpm add spx-di-react
```

## Интеграция в приложение

### 1. Создать DI контекст с TypeMap контейнера
Контекст создается с помощью функции `createDIContext`.
Все что ему нужно - предоставить `TypeMap` контейнера,
чтобы контекст знал о типах которые могут быть предоставлены.

Так как `TypeMap` может изменяться, по мере конфигурации контейнера,
его окончательный вариант можно получить
с помощью инструментального типа `TypeMapOfContainer`, который входит в 'spx-di'.

В результате выполнения `createDIContext`,
вернется типизированный объект, содержащий:
- `DIContextProvider` - Провайдер контекста, который используется 
                      для передачи контейнера через виртуальное дерево.
- `useDI` - React-hook, который предоставляет зависимости в функциональные компоненты;
- `withDI` - React-HOC, обертка предоставляющая зависимости через свойства компонента.

Все это нужно экспортировать, для доступа из других частей приложения.

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

### 2. Обернуть компонент приложения в DIContainer
Чтобы компоненты могли обращаться через `useDI` и `withDI` к контейнеру,
нужно предоставить его с помощью `DIContextProvider`.

Он требует передать ему сам контейнер, с которым он будет взаимодействовать:

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

### Получение зависимостей с помощью useDI
Использовать `useDI` - самый простой способ получить зависимости в компонентах.
Он требует только передать функцию, которая выполнит получение
необходимых зависимостей из контейнера.

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

### Получение зависимостей с помощью withDI
Аналогично можно получить зависимости с помощью `withDI`.
Он принимает такую же функцию. Но разница в том,
что поля возвращаемого объекта должны совпадать с именами свойств компонента,
в который предоставляются зависимости.

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
