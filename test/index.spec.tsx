import { Component, PropsWithChildren } from 'react'
import { render, renderHook } from '@testing-library/react'
import { DIContainer, DIError, TypeMapOfContainer } from '@spirex/di'
import createDIContext from '../src'

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
                error = err as DIError
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

it('Test withDI HOC for func component', () => {
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

class TestClassComponent extends Component<{value: string}> {
    public override render() {
        return <span>{this.props.value}</span>
    }
}

it('Test withDI HOC for class component', async () => {
    // Arrange
    const expectedValue = 'FooBar'
    const container = buildContainer(expectedValue)
    const { DIContextProvider, withDI } = createDIContext<TypeMapOfContainer<typeof container>>()

    const ContainerProvider = ({ children }: PropsWithChildren) => (
        <DIContextProvider container={container}>
            {children}
        </DIContextProvider>
    )

    const WrappedComponent = withDI(r => ({
        value: r.get('value'),
    }))(TestClassComponent)

    const result = render(<WrappedComponent/>, { wrapper: ContainerProvider })
    const renderedComponent = await result.findByText(expectedValue)
    expect(renderedComponent).not.toBeUndefined()
})