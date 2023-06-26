import React, {
    ComponentType,
    createContext,
    PropsWithChildren,
    ReactElement,
    useContext,
    useMemo,
} from 'react'
import { DIContainer, DIError } from '@spirex/di'

type TDIContainerProviderProps<TypeMap extends object> = {
    container: DIContainer<TypeMap>
}

type TInjectFunction<TypeMap extends object, TDependencies extends object> = (container: DIContainer<TypeMap>) => TDependencies

type TReactComponent<P = any> =
    | React.ClassicComponentClass<P>
    | React.ComponentClass<P>
    | React.FunctionComponent<P>
    | React.ForwardRefExoticComponent<P>

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
        if (!container) throw DIError.illegalState('DIContext is not provided.')
        return useMemo(() => inject(container), [])
    }

    function withDI<TInject extends object>(injectToProps: TInjectFunction<TypeMap, TInject>) {
        return <TProps extends TInject>(OriginComponent: TReactComponent<TProps>): ComponentType<Omit<TProps, keyof TInject>> => {
            return (props: Omit<TProps, keyof TInject>): ReactElement => {
                return (
                    <DIContext.Consumer>
                        {/* @ts-ignore */}
                        {c => <OriginComponent {...injectToProps(c)} {...props}/>}
                    </DIContext.Consumer>
                )
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
