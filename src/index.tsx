import {
    ComponentType,
    createContext,
    PropsWithChildren,
    ReactElement,
    useContext,
    useMemo,
} from 'react'
import {DIContainer, DIError} from 'spx-di'

type TDIContainerProviderProps<TypeMap extends object> = {
    container: DIContainer<TypeMap>
}

type TInjectFunction<TypeMap extends object, TDependencies extends object> = (container: DIContainer<TypeMap>) => TDependencies

function createDIContext<TypeMap extends object>() {
    const DIContext = createContext<DIContainer<TypeMap>>(null!)

    const DIContextProvider = ({
        container,
        children,
    }: PropsWithChildren<TDIContainerProviderProps<TypeMap>>) => (
        <DIContext.Provider value={container}>
            {children}
        </DIContext.Provider>
    )

    function useDI<TInject extends object>(inject: TInjectFunction<TypeMap, TInject>) {
        const container = useContext(DIContext)
        if (!container) throw new DIError('DIContext is not provided.')
        return useMemo(() => inject(container), [])
    }

    function withDI<TInject extends object>(injectToProps: TInjectFunction<TypeMap, TInject>) {
        return function<TProps extends TInject>(OriginComponent: ComponentType<TProps>): ComponentType<Omit<TProps, keyof TInject>> {
            return (props: Omit<TProps, keyof TInject>): ReactElement => {
                const dependencies = useDI(injectToProps)
                // @ts-ignore
                return <OriginComponent {...dependencies} {...props}/>
            }
        }
    }

    return {
        DIContextProvider,
        useDI,
        withDI,
    }
}

export default createDIContext
