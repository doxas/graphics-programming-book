
(() => {
    /**
     * canvas の幅
     * @type {number}
     */
    const CANVAS_WIDTH = 640;
    /**
     * canvas の高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 480;

    /**
     * Canvas2D API をラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util = null;
    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;
    /**
     * イメージのインスタンス
     * @type {Image}
     */
    let image = null;
    /**
     * 実行開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    /**
     * viper の X 座標
     * @type {number}
     */
    let viperX = CANVAS_WIDTH / 2;
    /**
     * viper の Y 座標
     * @type {number}
     */
    let viperY = CANVAS_HEIGHT / 2;
    /**
     * viper が登場中かどうかを表すフラグ
     * @type {boolean}
     */
    let isComing = false;
    /**
     * 登場演出を開始した際のタイムスタンプ
     * @type {number}
     */
    let comingStart = null;

    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;

        // まず最初に画像の読み込みを開始する
        util.imageLoader('./image/viper.png', (loadedImage) => {
            // 引数経由で画像を受け取り変数に代入しておく
            image = loadedImage;
            // 初期化処理を行う
            initialize();
            // イベントを設定する
            eventSetting();
            // 実行開始時のタイムスタンプを取得する
            startTime = Date.now();
            // 描画処理を行う
            render();
        });
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // 登場シーンからスタートするための設定
        isComing = true;          // 登場中フラグを立てる
        comingStart = Date.now(); // 登場開始のタイムスタンプを取得する
        viperY = CANVAS_HEIGHT;   // 画面外（下端の外）を初期位置にする
    }

    /**
     * イベントを設定する
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // 登場シーンなら何もしないで終了する
            if(isComing === true){return;}
            // 入力されたキーに応じて処理内容を変化させる
            switch(event.key){
                case 'ArrowLeft': // アローキーの左
                    viperX -= 10;
                    break;
                case 'ArrowRight': // アローキーの右
                    viperX += 10;
                    break;
                case 'ArrowUp':
                    viperY -= 10; // アローキーの上
                    break;
                case 'ArrowDown':
                    viperY += 10; // アローキーの下
                    break;
            }
        }, false);
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // 登場シーンの処理
        if(isComing === true){
            // 登場シーンが始まってからの経過時間
            let justTime = Date.now();
            let comingTime = (justTime - comingStart) / 1000;
            // 登場中は時間が経つほど上に向かって進む
            viperY = CANVAS_HEIGHT - comingTime * 50;
            // 一定の位置まで移動したら登場シーンを終了する
            if(viperY <= CANVAS_HEIGHT - 100){
                isComing = false;             // 登場シーンフラグを下ろす
                viperY = CANVAS_HEIGHT - 100; // 行き過ぎの可能性もあるので位置を再設定
            }
            // justTime を 100 で割ったとき余りが 50 より小さくなる場合だけ半透明にする
            if(justTime % 100 < 50){
                ctx.globalAlpha = 0.5;
            }
        }

        // 画像を描画する（現在の viper の位置に準じた位置に描画する）
        ctx.drawImage(image, viperX, viperY);

        // 恒常ループのために描画処理を再帰呼出しする
        requestAnimationFrame(render);
    }

    /**
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲（0 以上 ～ range 未満）
     */
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }
})();
