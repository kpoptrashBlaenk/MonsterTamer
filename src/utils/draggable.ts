import Phaser from 'phaser'

export function makeDraggable(gameObject: Phaser.GameObjects.Image) {
    gameObject.setInteractive()

    function onDrag(pointer: Phaser.Input.Pointer): void {
        gameObject.x = pointer.x
        gameObject.y = pointer.y
    }

    function stopDrag(): void {
        gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag)
        gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag)
        gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag)
        gameObject.x = Math.round(gameObject.x)
        gameObject.y = Math.round(gameObject.y)
    }

    function startDrag(): void {
        gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag)
        gameObject.on(Phaser.Input.Events.POINTER_MOVE, onDrag)
        gameObject.on(Phaser.Input.Events.POINTER_UP, stopDrag)
    }

    function destroy(): void {
        gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag)
        gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag)
        gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag)
    }

    gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag)
    gameObject.once(Phaser.GameObjects.Events.DESTROY, destroy)
}