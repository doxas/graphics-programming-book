
/**
 * 座標を管理するためのクラス
 */
class Position {
    /**
     * @constructor
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     */
    constructor(x, y){
        /**
         * X 座標
         * @type {number}
         */
        this.x = x;
        /**
         * Y 座標
         * @type {number}
         */
        this.y = y;
    }

    /**
     * 値を設定する
     * @param {number} [x] - 設定する X 座標
     * @param {number} [y] - 設定する Y 座標
     */
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {number} life - キャラクターのライフ（生存フラグを兼ねる）
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx, x, y, w, h, life, image){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        /**
         * @type {Position}
         */
        this.position = new Position(x, y);
        /**
         * @type {number}
         */
        this.width = w;
        /**
         * @type {number}
         */
        this.height = h;
        /**
         * @type {number}
         */
        this.life = life;
        /**
         * @type {Image}
         */
        this.image = image;
    }

    /**
     * キャラクターを描画する
     */
    draw(){
        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }
}

/**
 * viper クラス
 */
class Viper extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {Image} image - キャラクターの画像
     */
    constructor(ctx, x, y, w, h, image){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, image);

        /**
         * 自身の移動スピード（update 一回あたりの移動量）
         * @type {number}
         */
        this.speed = 3;
        /**
         * viper が登場中かどうかを表すフラグ
         * @type {boolean}
         */
        this.isComing = false;
        /**
         * 登場演出を開始した際のタイムスタンプ
         * @type {number}
         */
        this.comingStart = null;
        /**
         * 登場演出を開始する座標
         * @type {Position}
         */
        this.comingStartPosition = null;
        /**
         * 登場演出を完了とする座標
         * @type {Position}
         */
        this.comingEndPosition = null;
    }

    /**
     * 登場演出に関する設定を行う
     * @param {number} startX - 登場開始時の X 座標
     * @param {number} startY - 登場開始時の Y 座標
     * @param {number} endX - 登場終了とする X 座標
     * @param {number} endY - 登場終了とする Y 座標
     */
    setComing(startX, startY, endX, endY){
        // 登場中のフラグを立てる
        this.isComing = true;
        // 登場開始時のタイムスタンプを取得する
        this.comingStart = Date.now();
        // 登場開始位置に自機を移動させる
        this.position.set(startX, startY);
        // 登場開始位置を設定する
        this.comingStartPosition = new Position(startX, startY);
        // 登場終了とする座標を設定する
        this.comingEndPosition = new Position(endX, endY);
    }

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // 登場シーンかどうかに応じて処理を振り分ける
        if(this.isComing === true){
            // 登場シーンが始まってからの経過時間
            let comingTime = (justTime - this.comingStart) / 1000;
            // 登場中は時間が経つほど上に向かって進む
            let y = this.comingStartPosition.y - comingTime * 50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(y <= this.comingEndPosition.y){
                this.isComing = false;        // 登場シーンフラグを下ろす
                y = this.comingEndPosition.y; // 行き過ぎの可能性もあるので位置を再設定
            }
            // 求めた Y 座標を自機に設定する
            this.position.set(this.position.x, y);

            // 自機の登場演出時は点滅させる
            if(justTime % 100 < 50){
                this.ctx.globalAlpha = 0.5;
            }
        }else{
            // キーの押下状態を調べて挙動を変える
            if(window.isKeyDown.key_ArrowLeft === true){
                this.position.x -= this.speed; // アローキーの左
            }
            if(window.isKeyDown.key_ArrowRight === true){
                this.position.x += this.speed; // アローキーの右
            }
            if(window.isKeyDown.key_ArrowUp === true){
                this.position.y -= this.speed; // アローキーの上
            }
            if(window.isKeyDown.key_ArrowDown === true){
                this.position.y += this.speed; // アローキーの下
            }
            // 移動後の位置が画面外へ出ていないか確認して修正する
            let canvasWidth = this.ctx.canvas.width;
            let canvasHeight = this.ctx.canvas.height;
            let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
            let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
            this.position.set(tx, ty);
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

