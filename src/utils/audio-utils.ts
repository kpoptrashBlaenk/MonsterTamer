import {DATA_MANAGER_STORE_KEYS, dataManager} from "./data-manager";
import {SOUND_OPTIONS} from "../common/options";
import BaseSound = Phaser.Sound.BaseSound;

export function playBackgroundMusic(scene: Phaser.Scene, audioKey: string): void {
    if (dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) !== SOUND_OPTIONS.ON) {
        return
    }

    const existingSounds = scene.sound.getAllPlaying()
    let musicAlreadyPlaying = false

    existingSounds.forEach((sound: BaseSound) => {
        if (sound.key === audioKey) {
            musicAlreadyPlaying = true
            return
        }
        sound.stop()
    })

    if (!musicAlreadyPlaying) {
        scene.sound.play(audioKey, {
            loop: true,
        })
    }
}

export function playSoundFx(scene: Phaser.Scene, audioKey: string): void {
    if (dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) !== SOUND_OPTIONS.ON) {
        return
    }

    const baseVolume = dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME) * 0.25

    scene.sound.play(audioKey, {
        volume: 20 * baseVolume
    })
}

export function setGlobalSoundSettings(scene:Phaser.Scene): void {
    scene.sound.setVolume(dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_VOLUME) * 0.25)
    scene.sound.setMute(dataManager.getStore.get(DATA_MANAGER_STORE_KEYS.OPTIONS_SOUND) === SOUND_OPTIONS.OFF)
}