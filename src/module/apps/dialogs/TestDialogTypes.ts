export interface TestDialogLike {
    render: (...args: any[]) => unknown
}

/**
 * A way of allowing tests to inject handlers without having to sub-class the whole dialog
 */
export interface TestDialogListener {
    query: string
    on: string
    callback: (event: any, dialog: TestDialogLike) => void
}
