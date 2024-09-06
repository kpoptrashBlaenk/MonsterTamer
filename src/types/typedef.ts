/**
 * @typedef BattleMonsterConfig
 * @type {Object}
 * @property {Phaser.Scene} scene
 * @property {Monster} monsterDetails
 * @property {number} [scaleHealthBarBackgroundImageByY=1]
 * @property {boolean} [skipBattleAnimations=false]
 */

/**
 * @typedef Monster
 * @type {Object}
 * @property {string} name
 * @property {string} assetKey
 * @property {number} [assetFrame=0]
 * @property {number} currentLevel
 * @property {number} maxHp
 * @property {number} currentHp
 * @property {number} baseAttack
 * @property {number[]} attackIds
 */

/**
 * @typedef Coordinate
 * @type {Object}
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef Attack
 * @type {Object}
 * @property {number} id
 * @property {string} name
 * @property {AttackKeys} animationName
 */

/**
 * @typedef CustomAnimation
 * @type {Object}
 * @property {string} key
 * @property {number[]} [frames]
 * @property {number} frameRate
 * @property {number} repeat
 * @property {number} delay
 * @property {string} assetKey
 */