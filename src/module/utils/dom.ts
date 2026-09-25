/**
 * DOM helpers that work across browser windows.
 */

type ElementConstructor = abstract new (...args: any[]) => HTMLElement;

/**
 * Test whether a value is an instance of an HTMLElement class, regardless of the window it was created in.
 *
 * Applications rendered into a detached window own elements built from that window's globals, so a plain
 * `instanceof` against the main window's classes fails for them.
 *
 * @param value The value to test, typically an event target.
 * @param cls The HTMLElement class to test against.
 */
export function isElementInstance<T extends ElementConstructor>(value: unknown, cls: T): value is InstanceType<T> {
    if (value instanceof cls) return true;
    if (!value || typeof value !== 'object') return false;
    return foundry.utils.isElementInstanceOf(value as HTMLElement, cls);
}

/** Give non-button controls native-style Enter and Space activation. */
export function activateOnKey(element: HTMLElement) {
    element.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        element.click();
    });
}
