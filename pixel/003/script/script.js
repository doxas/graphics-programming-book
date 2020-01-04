
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
     * イメージのインスタンス
     * @type {Image}
     */
    let image = null;
    /**
     * Canvas Element の大きさ
     * @type {number}
     */
    const CANVAS_SIZE = 512;

    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // まず最初に画像の読み込みを開始する
        imageLoader('./image/sample.jpg', (loadedImage) => {
            // 引数経由で画像を受け取り変数に代入しておく
            image = loadedImage;
            // 初期化処理を行う
            initialize();
            // 描画処理を行う
            render();
        });
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        // querySelector を利用して canvas を参照
        canvas = document.body.querySelector('#main_canvas');
        // canvas の大きさをウィンドウ全体を覆うように変更する
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        // canvas からコンテキストを取得する
        ctx = canvas.getContext('2d');
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // まず画像をそのまま描画する
        ctx.drawImage(image, 0, 0);
        // Canvas から ImageData を抽出する
        let imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        // フィルタ処理を実行する
        let outputData = grayscaleFilter(imageData);
        // Canvas に対して ImageData を書き戻す
        ctx.putImageData(outputData, 0, 0);
    }

    /**
     * グレイスケールフィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function grayscaleFilter(imageData){
        let width = imageData.width;   // 幅
        let height = imageData.height; // 高さ
        let data = imageData.data;     // ピクセルデータ
        // 出力用に ImageData オブジェクトを生成しておく
        let out = ctx.createImageData(width, height);
        // 縦方向に進んでいくためのループ
        for(let i = 0; i < height; ++i){
            // 横方向に進んでいくためのループ
            for(let j = 0; j < width; ++j){
                // ループカウンタから該当するインデックスを求める
                // RGBA の各要素からなることを考慮して 4 を乗算する
                let index = (i * width + j) * 4;
                // インデックスを元に RGBA の各要素にアクセスする
                let r = data[index];
                let g = data[index + 1];
                let b = data[index + 2];
                // RGB の各値を合算して均等化する
                let luminance = (r + g + b) / 3;
                // 均等化した値を RGB に書き出す
                out.data[index]     = luminance;
                out.data[index + 1] = luminance;
                out.data[index + 2] = luminance;
                out.data[index + 3] = data[index + 3];
            }
        }
        return out;
    }

    /**
     * ネガポジ反転フィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function invertFilter(imageData){
        let width = imageData.width;   // 幅
        let height = imageData.height; // 高さ
        let data = imageData.data;     // ピクセルデータ
        // 出力用に ImageData オブジェクトを生成しておく
        let out = ctx.createImageData(width, height);
        // 縦方向に進んでいくためのループ
        for(let i = 0; i < height; ++i){
            // 横方向に進んでいくためのループ
            for(let j = 0; j < width; ++j){
                // ループカウンタから該当するインデックスを求める
                // RGBA の各要素からなることを考慮して 4 を乗算する
                let index = (i * width + j) * 4;
                // インデックスを元に RGBA の各要素にアクセスする
                // 255 から減算することで色を反転させる
                out.data[index]     = 255 - data[index];
                out.data[index + 1] = 255 - data[index + 1];
                out.data[index + 2] = 255 - data[index + 2];
                out.data[index + 3] = data[index + 3];
            }
        }
        return out;
    }

    /**
     * 画像をロードしてコールバック関数にロードした画像を与え呼び出す
     * @param {string} path - 画像ファイルのパス
     * @param {function} [callback] - コールバック関数
     */
    function imageLoader(path, callback){
        // 画像のインスタンスを生成する
        let target = new Image();
        // 画像がロード完了したときの処理を先に記述する
        target.addEventListener('load', () => {
            // もしコールバックがあれば呼び出す
            if(callback != null){
                // コールバック関数の引数に画像を渡す
                callback(target);
            }
        }, false);
        // 画像のロードを開始するためにパスを指定する
        target.src = path;
    }
})();
