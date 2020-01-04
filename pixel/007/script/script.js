
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
        let outputData = mosaicFilter(imageData, 8);
        // Canvas に対して ImageData を書き戻す
        ctx.putImageData(outputData, 0, 0);
    }

    /**
     * モザイクフィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @param {number} blockSize - モザイクのブロックひとつあたりのサイズ
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function mosaicFilter(imageData, blockSize){
        let width = imageData.width;   // 幅
        let height = imageData.height; // 高さ
        let data = imageData.data;     // ピクセルデータ
        // 出力用に ImageData オブジェクトを生成しておく
        let out = ctx.createImageData(width, height);
        // 縦方向に進んでいくためのループ
        for(let i = 0; i < height; ++i){
            // 横方向に進んでいくためのループ
            for(let j = 0; j < width; ++j){
                // 本来のインデックス
                let index = (i * width + j) * 4;
                // ループカウンタを元に blockSize で切り捨てる
                let x = Math.floor(j / blockSize) * blockSize;
                let y = Math.floor(i / blockSize) * blockSize;
                // 切り捨てた値からインデックスを求める
                let floorIndex = (y * width + x) * 4;
                // インデックスを元に RGBA の各要素にアクセスする
                out.data[index]     = data[floorIndex];
                out.data[index + 1] = data[floorIndex + 1];
                out.data[index + 2] = data[floorIndex + 2];
                out.data[index + 3] = data[floorIndex + 3];
            }
        }
        return out;
    }

    /**
     * メディアンフィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function medianFilter(imageData){
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
                let index       = (i * width + j) * 4;
                // 上下左右の各ピクセルのインデックスを求める
                let topIndex    = (Math.max(i - 1, 0) * width + j) * 4;
                let bottomIndex = (Math.min(i + 1, height - 1) * width + j) * 4;
                let leftIndex   = (i * width + Math.max(j - 1, 0)) * 4;
                let rightIndex  = (i * width + Math.min(j + 1, width - 1)) * 4;
                // 斜め方向（四隅）の各ピクセルのインデックスを求める
                let topLeftIndex     = (Math.max(i - 1, 0) * width + Math.max(j - 1, 0)) * 4;
                let bottomLeftIndex  = (Math.min(i + 1, height - 1) * width + Math.max(j - 1, 0)) * 4;
                let topRightIndex    = (Math.max(i - 1, 0) * width + Math.min(j + 1, width - 1)) * 4;
                let bottomRightIndex = (Math.min(i + 1, height - 1) * width + Math.min(j + 1, width - 1)) * 4;
                // すべてのピクセルの輝度を求めた上で
                // 本来のインデックスと共に配列に格納
                let luminanceArray = [
                    {index: index,            luminance: getLuminance(data, index)},
                    {index: topIndex,         luminance: getLuminance(data, topIndex)},
                    {index: bottomIndex,      luminance: getLuminance(data, bottomIndex)},
                    {index: leftIndex,        luminance: getLuminance(data, leftIndex)},
                    {index: rightIndex,       luminance: getLuminance(data, rightIndex)},
                    {index: topLeftIndex,     luminance: getLuminance(data, topLeftIndex)},
                    {index: bottomLeftIndex,  luminance: getLuminance(data, bottomLeftIndex)},
                    {index: topRightIndex,    luminance: getLuminance(data, topRightIndex)},
                    {index: bottomRightIndex, luminance: getLuminance(data, bottomRightIndex)}
                ];
                // 配列内の輝度値を基準にソートする
                luminanceArray.sort((a, b) => {
                    // Array.sort では 0 未満の値が返されると小さな値として並び替える
                    return a.luminance - b.luminance;
                });
                // 中央値となるインデックスが 4 の要素を取り出す
                let sorted = luminanceArray[4];
                // 対象のインデックスを持つピクセルの色を書き出す
                out.data[index]     = data[sorted.index];
                out.data[index + 1] = data[sorted.index + 1];
                out.data[index + 2] = data[sorted.index + 2];
                out.data[index + 3] = data[sorted.index + 3];
            }
        }
        return out;
    }

    /**
     * ImageData の要素から輝度を算出する
     * @param {Uint8ClampedArray} data - ImageData.data
     * @param {number} index - 対象のインデックス
     * @return {number} RGB を均等化した輝度値
     */
    function getLuminance(data, index){
        let r = data[index];
        let g = data[index + 1];
        let b = data[index + 2];
        return (r + g + b) / 3;
    }

    /**
     * ラプラシアンフィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function laplacianFilter(imageData){
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
                let index       = (i * width + j) * 4;
                // 上下左右の各ピクセルのインデックスを求める
                let topIndex    = (Math.max(i - 1, 0) * width + j) * 4;
                let bottomIndex = (Math.min(i + 1, height - 1) * width + j) * 4;
                let leftIndex   = (i * width + Math.max(j - 1, 0)) * 4;
                let rightIndex  = (i * width + Math.min(j + 1, width - 1)) * 4;
                // 上下左右の色は加算、中心の色は -4 を乗算してから加算する
                let r = data[topIndex] +
                        data[bottomIndex] +
                        data[leftIndex] +
                        data[rightIndex] +
                        data[index] * -4;
                let g = data[topIndex + 1] +
                        data[bottomIndex + 1] +
                        data[leftIndex + 1] +
                        data[rightIndex + 1] +
                        data[index + 1] * -4;
                let b = data[topIndex + 2] +
                        data[bottomIndex + 2] +
                        data[leftIndex + 2] +
                        data[rightIndex + 2] +
                        data[index + 2] * -4;
                // 絶対値の合計を均等化して RGB に書き出す
                let value = (Math.abs(r) + Math.abs(g) + Math.abs(b)) / 3;
                out.data[index]     = value;
                out.data[index + 1] = value;
                out.data[index + 2] = value;
                out.data[index + 3] = data[index + 3];
            }
        }
        return out;
    }

    /**
     * 二値化フィルタを行う
     * @param {ImageData} imageData - 対象となる ImageData
     * @return {ImageData} フィルタ処理を行った結果の ImageData
     */
    function binarizationFilter(imageData){
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
                // 均等化した値がしきい値以上かどうかを判定
                let value = luminance >= 128 ? 255 : 0;
                out.data[index]     = value;
                out.data[index + 1] = value;
                out.data[index + 2] = value;
                out.data[index + 3] = data[index + 3];
            }
        }
        return out;
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
