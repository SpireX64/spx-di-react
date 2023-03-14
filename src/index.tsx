import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
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

    return {
        DIContextProvider,
        useDI,
    }
}

export default createDIContext
