import { EditorDropdowns } from './EditorDropdowns';

export class EditorManager {
    static registerMenuItems(): void {     
        EditorDropdowns.setProseMirrorDropdowns()
    }
}
