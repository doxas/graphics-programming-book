
/**
 * Canvas2D API をラップしたユーティリティクラス
 */
class Canvas2DUtility {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - 対象となる canvas element
     */
    constructor(canvas){
        /**
         * @type {HTMLCanvasElement}
         */
        this.canvasElement = canvas;
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context2d = canvas.getContext('2d');
    }

    /**
     * @return {HTMLCanvasElement}
     */
    get canvas(){return this.canvasElement;}
    /**
     * @return {CanvasRenderingContext2D}
     */
    get context(){return this.context2d;}

    /**
     * 矩形を描画する
     * @param {number} x - 塗りつぶす矩形の左上角の X 座標
     * @param {number} y - 塗りつぶす矩形の左上角の Y 座標
     * @param {number} width - 塗りつぶす矩形の横幅
     * @param {number} height - 塗りつぶす矩形の高さ
     * @param {string} [color] - 矩形を塗りつぶす際の色
     */
    drawRect(x, y, width, height, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillRect(x, y, width, height);
    }
    /**
     * 線分を描画する
     * @param {number} x1 - 線分の始点の X 座標
     * @param {number} y1 - 線分の始点の Y 座標
     * @param {number} x2 - 線分の終点の X 座標
     * @param {number} y2 - 線分の終点の Y 座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawLine(x1, y1, x2, y2, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 直線のパスを終点座標に向けて設定する
        this.context2d.lineTo(x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    /**
     * 多角形を描画する
     * @param {Array<number>} points - 多角形の各頂点の座標
     * @param {string} [color] - 多角形を描画する際の色
     */
    drawPolygon(points, color){
        // points が配列であるかどうか確認し、多角形を描くために
        // 十分な個数のデータが存在するか調べる
        if(Array.isArray(points) !== true || points.length < 6){
            return;
        }
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(points[0], points[1]);
        // 各頂点を結ぶパスを設定する
        for(let i = 2; i < points.length; i += 2){
            this.context2d.lineTo(points[i], points[i + 1]);
        }
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで多角形の描画を行う
        this.context2d.fill();
    }

    /**
     * 円を描画する
     * @param {number} x - 円の中心位置の X 座標
     * @param {number} y - 円の中心位置の Y 座標
     * @param {number} radius - 円の半径
     * @param {string} [color] - 円を描画する際の色
     */
    drawCircle(x, y, radius, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // 円のパスを設定する
        this.context2d.arc(x, y, radius, 0.0, Math.PI * 2.0);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで円の描画を行う
        this.context2d.fill();
    }

    /**
     * 扇形を描画する
     * @param {number} x - 扇形を形成する円の中心位置の X 座標
     * @param {number} y - 扇形を形成する円の中心位置の Y 座標
     * @param {number} radius - 扇形を形成する円の半径
     * @param {number} startRadian - 扇形の開始角
     * @param {number} endRadian - 扇形の終了角
     * @param {string} [color] - 扇形を描画する際の色
     */
    drawFan(x, y, radius, startRadian, endRadian, color){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスを扇形を形成する円の中心に移動する
        this.context2d.moveTo(x, y);
        // 円のパスを設定する
        this.context2d.arc(x, y, radius, startRadian, endRadian);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで扇形の描画を行う
        this.context2d.fill();
    }

    /**
     * 線分を二次ベジェ曲線で描画する
     * @param {number} x1 - 線分の始点の X 座標
     * @param {number} y1 - 線分の始点の Y 座標
     * @param {number} x2 - 線分の終点の X 座標
     * @param {number} y2 - 線分の終点の Y 座標
     * @param {number} cx - 制御点の X 座標
     * @param {number} cy - 制御点の Y 座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawQuadraticBezier(x1, y1, x2, y2, cx, cy, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 二次ベジェ曲線の制御点と終点を設定する
        this.context2d.quadraticCurveTo(cx, cy, x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    /**
     * 線分を三次ベジェ曲線で描画する
     * @param {number} x1 - 線分の始点の X 座標
     * @param {number} y1 - 線分の始点の Y 座標
     * @param {number} x2 - 線分の終点の X 座標
     * @param {number} y2 - 線分の終点の Y 座標
     * @param {number} cx1 - 始点の制御点の X 座標
     * @param {number} cy1 - 始点の制御点の Y 座標
     * @param {number} cx2 - 終点の制御点の X 座標
     * @param {number} cy2 - 終点の制御点の Y 座標
     * @param {string} [color] - 線を描画する際の色
     * @param {number} [width=1] - 線幅
     */
    drawCubicBezier(x1, y1, x2, y2, cx1, cy1, cx2, cy2, color, width = 1){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.strokeStyle = color;
        }
        // 線幅を設定する
        this.context2d.lineWidth = width;
        // パスの設定を開始することを明示する
        this.context2d.beginPath();
        // パスの始点を設定する
        this.context2d.moveTo(x1, y1);
        // 三次ベジェ曲線の制御点と終点を設定する
        this.context2d.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        // パスを閉じることを明示する
        this.context2d.closePath();
        // 設定したパスで線描画を行う
        this.context2d.stroke();
    }

    /**
     * テキストを描画する
     * @param {string} text - 描画するテキスト
     * @param {number} x - テキストを描画する位置の X 座標
     * @param {number} y - テキストを描画する位置の Y 座標
     * @param {string} [color] - テキストを描画する際の色
     * @param {number} [width] - テキストを描画する幅に上限を設定する際の上限値
     */
    drawText(text, x, y, color, width){
        // 色が指定されている場合はスタイルを設定する
        if(color != null){
            this.context2d.fillStyle = color;
        }
        this.context2d.fillText(text, x, y, width);
    }

    /**
     * 画像をロードしてコールバック関数にロードした画像を与え呼び出す
     * @param {string} path - 画像ファイルのパス
     * @param {function} [callback] - コールバック関数
     */
    imageLoader(path, callback){
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
}

