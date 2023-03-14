import { PropsWithChildren } from 'react'
import { render, renderHook } from '@testing-library/react'
import createDIContext from '../src'
import { DIContainer, DIError, TypeMapOfContainer } from 'spx-di'

function buildContainer(value: string) {
    return  DIContainer.builder<{
        value: string
    }>()
        .bindInstance('value', value)
        .build()
}

it('Test useDI hook without context provider', () => {
    // Arrange --------
    const container = buildContainer('qwe')
    const { useDI } = createDIContext<TypeMapOfContainer<typeof container>>()

    // Act -------------
    let error: DIError | null = null
    renderHook(() => {
        try {
            return useDI(r => ({
                value: r.get('value'),
            }));
        } catch (err) {
            if (err instanceof DIError) {
                error = err
            }
        }
        return undefined
    })

    // Assert ----------
    expect(error).not.toBeNull()
    // @ts-ignore
    expect(error?.message).toBe('DIContext is not provided.')
})

it('Test useDI hook', () => {
    // Arrange -----------------------
    const expectedValue = 'Hello'
    const container = buildContainer(expectedValue)
    const { DIContextProvider, useDI } = createDIContext<TypeMapOfContainer<typeof container>>()

    // Act ---------------
    const ContainerProvider = ({ children }: PropsWithChildren) => (
        <DIContextProvider container={container}>
            {children}
        </DIContextProvider>
    )

    const { result } = renderHook(
        () => useDI(r => ({
            value: r.get('value'),
        })),
        { wrapper: ContainerProvider },
    )

    // Expect -------------
    expect(result.current?.value).toBe(expectedValue)
})

it('Test withDI HOC', () => {
    // Arrange
    const expectedValue = 'FooBar'
    const container = buildContainer(expectedValue)
    const { DIContextProvider, withDI } = createDIContext<TypeMapOfContainer<typeof container>>()
    const MockComponent = jest.fn(() => null)

    const ContainerProvider = ({ children }: PropsWithChildren) => (
        <DIContextProvider container={container}>
            {children}
        </DIContextProvider>
    )
    const WrappedComponent = withDI(r => ({
        value: r.get('value'),
    }))(MockComponent)

    render(<WrappedComponent/>, { wrapper: ContainerProvider })

    expect(MockComponent.mock.calls.length).toBe(1)
    // @ts-ignore
    expect(MockComponent.mock.calls[0]?.[0]?.value).toBe(expectedValue)
})
