import Phaser from '../lib/phaser.ts';

export function makeDraggable(gameObject: Phaser.GameObjects.Image, enableLogs: boolean = false) {
    gameObject.setInteractive();

    function log(message: string): void {
        if (enableLogs) {
            console.debug(message);
        }
    }

    function onDrag(pointer: Phaser.Input.Pointer): void {
        log(`[makeDraggable:onDrag] invoked for game object: ${gameObject.name}`);
        gameObject.x = pointer.x;
        gameObject.y = pointer.y;
    }

    function stopDrag(): void {
        log(`[makeDraggable:stopDrag] invoked for game object: ${gameObject.name}`);
        gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);
        gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag);
        gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag);
        gameObject.x = Math.round(gameObject.x);
        gameObject.y = Math.round(gameObject.y);
    }

    function startDrag(): void {
        log(`[makeDraggable:startDrag] invoked for game object: ${gameObject.name}`);
        gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag);
        gameObject.on(Phaser.Input.Events.POINTER_MOVE, onDrag);
        gameObject.on(Phaser.Input.Events.POINTER_UP, stopDrag);
    }

    function destroy(): void {
        log(`[makeDraggable:destroy] invoked for game object: ${gameObject.name}`);
        gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag);
        gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag);
        gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag);
    }

    gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);
    gameObject.once(Phaser.GameObjects.Events.DESTROY, destroy);
}