
// グローバル汚染を避けるために即時関数を使って全体を囲う
(() => {
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
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // 初期化処理を行う
        initialize();
        // 描画処理を行う
        render();
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        // HTML 上の canvas には id 属性が振られているので
        // querySelector を利用して参照し、変数に格納する
        canvas = document.body.querySelector('#main_canvas');
        // canvas の大きさをウィンドウ全体を覆うように変更する
        canvas.width = window.innerWidth;   // 幅
        canvas.height = window.innerHeight; // 高さ
        // canvas からコンテキストを取得する
        ctx = canvas.getContext('2d');
    }

    /**
     * 塗り色を設定し塗りつぶす
     */
    function render(){
        // canvas 全体を黒く塗りつぶすため塗り色のスタイルを設定する
        ctx.fillStyle = '#000000'; // または 'black' でもよい

        // canvas 全体を塗りつぶす
        // @param {number} x - 塗りつぶす矩形の左上角の X 座標
        // @param {number} y - 塗りつぶす矩形の左上角の Y 座標
        // @param {number} w - 塗りつぶす矩形の横幅
        // @param {number} h - 塗りつぶす矩形の高さ
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
})();
