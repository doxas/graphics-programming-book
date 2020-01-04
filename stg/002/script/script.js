
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
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');

        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;
        // 時間の経過が見た目にわかりやすいように自機をサイン波で動かす
        let s = Math.sin(nowTime);
        // サインやコサインは半径１の円を基準にしているので、得られる値の範囲が
        // -1.0 ～ 1.0 になるため、効果がわかりやすくなるように 100 倍する
        let x = s * 100.0;

        // 画像を描画する（canvas の中心位置を基準にサイン波で左右に往復するようにする）
        ctx.drawImage(image, CANVAS_WIDTH / 2 + x, CANVAS_HEIGHT / 2);

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
