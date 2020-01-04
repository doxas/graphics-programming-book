
(() => {
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};
    /**
     * スコアを格納する
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {number}
     */
    window.gameScore = 0;

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
     * 敵キャラクター（小）のインスタンス数
     * @type {number}
     */
    const ENEMY_SMALL_MAX_COUNT = 20;
    /**
     * 敵キャラクター（大）のインスタンス数
     * @type {number}
     */
    const ENEMY_LARGE_MAX_COUNT = 5;
    /**
     * ショットの最大個数
     * @type {number}
     */
    const SHOT_MAX_COUNT = 10;
    /**
     * 敵キャラクターのショットの最大個数
     * @type {number}
     */
    const ENEMY_SHOT_MAX_COUNT = 50;
    /**
     * 爆発エフェクトの最大個数
     * @type {number}
     */
    const EXPLOSION_MAX_COUNT = 10;
    /**
     * 背景を流れる星の個数
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_COUNT = 100;
    /**
     * 背景を流れる星の最大サイズ
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_SIZE = 3;
    /**
     * 背景を流れる星の最大速度
     * @type {number}
     */
    const BACKGROUND_STAR_MAX_SPEED = 4;

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
     * シーンマネージャー
     * @type {SceneManager}
     */
    let scene = null;
    /**
     * 実行開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    /**
     * 自機キャラクターのインスタンス
     * @type {Viper}
     */
    let viper = null;
    /**
     * 敵キャラクターのインスタンスを格納する配列
     * @type {Array<Enemy>}
     */
    let enemyArray = [];
    /**
     * ショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let shotArray = [];
    /**
     * シングルショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let singleShotArray = [];
    /**
     * 敵キャラクターのショットのインスタンスを格納する配列
     * @type {Array<Shot>}
     */
    let enemyShotArray = [];
    /**
     * 爆発エフェクトのインスタンスを格納する配列
     * @type {Array<Explosion>}
     */
    let explosionArray = [];
    /**
     * 流れる星のインスタンスを格納する配列
     * @type {Array<BackgroundStar>}
     */
    let backgroundStarArray = [];
    /**
     * 再スタートするためのフラグ
     * @type {boolean}
     */
    let restart = false;

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

        // 初期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        let i;
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // シーンを初期化する
        scene = new SceneManager();

        // 爆発エフェクトを初期化する
        for(i = 0; i < EXPLOSION_MAX_COUNT; ++i){
            explosionArray[i] = new Explosion(ctx, 100.0, 15, 40.0, 1.0);
        }

        // 自機のショットを初期化する
        for(i = 0; i < SHOT_MAX_COUNT; ++i){
            shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
            singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
            singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
        }

        // 自機キャラクターを初期化する
        viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
        // 登場シーンからスタートするための設定を行う
        viper.setComing(
            CANVAS_WIDTH / 2,   // 登場演出時の開始 X 座標
            CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
            CANVAS_WIDTH / 2,   // 登場演出を終了とする X 座標
            CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
        );
        // ショットを自機キャラクターに設定する
        viper.setShotArray(shotArray, singleShotArray);

        // 敵キャラクターのショットを初期化する
        for(i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i){
            enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
            enemyShotArray[i].setTargets([viper]); // 引数は配列なので注意
            enemyShotArray[i].setExplosions(explosionArray);
        }

        // 敵キャラクター（小）を初期化する
        for(i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
            enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
            // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
            enemyArray[i].setShotArray(enemyShotArray);
            // 敵キャラクターは常に自機キャラクターを攻撃対象とする
            enemyArray[i].setAttackTarget(viper);
        }

        // 敵キャラクター（大）を初期化する
        for(i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i){
            enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, './image/enemy_large.png');
            // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
            enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
            // 敵キャラクターは常に自機キャラクターを攻撃対象とする
            enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
        }

        // 衝突判定を行うために対象を設定する
        // 爆発エフェクトを行うためにショットに設定する
        for(i = 0; i < SHOT_MAX_COUNT; ++i){
            shotArray[i].setTargets(enemyArray);
            singleShotArray[i * 2].setTargets(enemyArray);
            singleShotArray[i * 2 + 1].setTargets(enemyArray);
            shotArray[i].setExplosions(explosionArray);
            singleShotArray[i * 2].setExplosions(explosionArray);
            singleShotArray[i * 2 + 1].setExplosions(explosionArray);
        }

        // 流れる星を初期化する
        for(i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
            // 星の速度と大きさはランダムと最大値によって決まるようにする
            let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
            let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
            // 星のインスタンスを生成する
            backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
            // 星の初期位置もランダムに決まるようにする
            let x = Math.random() * CANVAS_WIDTH;
            let y = Math.random() * CANVAS_HEIGHT;
            backgroundStarArray[i].set(x, y);
        }
    }

    /**
     * インスタンスの準備が完了しているか確認する
     */
    function loadCheck(){
        // 準備完了を意味する真偽値
        let ready = true;
        // AND 演算で準備完了しているかチェックする
        ready = ready && viper.ready;
        // 同様に敵キャラクターの準備状況も確認する
        enemyArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様にショットの準備状況も確認する
        shotArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様にシングルショットの準備状況も確認する
        singleShotArray.map((v) => {
            ready = ready && v.ready;
        });
        // 同様に敵キャラクターのショットの準備状況も確認する
        enemyShotArray.map((v) => {
            ready = ready && v.ready;
        });

        // 全ての準備が完了したら次の処理に進む
        if(ready === true){
            // イベントを設定する
            eventSetting();
            // シーンを定義する
            sceneSetting();
            // 実行開始時のタイムスタンプを取得する
            startTime = Date.now();
            // 描画処理を開始する
            render();
        }else{
            // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
            setTimeout(loadCheck, 100);
        }
    }

    /**
     * イベントを設定する
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
            // ゲームオーバーから再スタートするための設定（エンターキー）
            if(event.key === 'Enter'){
                // 自機キャラクターのライフが 0 以下の状態
                if(viper.life <= 0){
                    // 再スタートフラグを立てる
                    restart = true;
                }
            }
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
        }, false);
    }

    /**
     * シーンを設定する
     */
    function sceneSetting(){
        // イントロシーン
        scene.add('intro', (time) => {
            // 3 秒経過したらシーンを invade_default_type に変更する
            if(time > 3.0){
                scene.use('invade_default_type');
            }
        });
        // invade シーン（default type の敵キャラクターを生成）
        scene.add('invade_default_type', (time) => {
            // シーンのフレーム数が 30 で割り切れるときは敵キャラクターを配置する
            if(scene.frame % 30 === 0){
                // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
                for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
                    if(enemyArray[i].life <= 0){
                        let e = enemyArray[i];
                        // ここからさらに２パターンに分ける
                        // frame を 60 で割り切れるかどうかで分岐する
                        if(scene.frame % 60 === 0){
                            // 左側面から出てくる
                            e.set(-e.width, 30, 2, 'default');
                            // 進行方向は 30 度の方向
                            e.setVectorFromAngle(degreesToRadians(30));
                        }else{
                            // 右側面から出てくる
                            e.set(CANVAS_WIDTH + e.width, 30, 2, 'default');
                            // 進行方向は 150 度の方向
                            e.setVectorFromAngle(degreesToRadians(150));
                        }
                        break;
                    }
                }
            }
            // シーンのフレーム数が 270 になったとき次のシーンへ
            if(scene.frame === 270){
                scene.use('blank');
            }
            // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
            if(viper.life <= 0){
                scene.use('gameover');
            }
        });
        // 間隔調整のための空白のシーン
        scene.add('blank', (time) => {
            // シーンのフレーム数が 150 になったとき次のシーンへ
            if(scene.frame === 150){
                scene.use('invade_wave_move_type');
            }
            // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
            if(viper.life <= 0){
                scene.use('gameover');
            }
        });
        // invade シーン（wave move type の敵キャラクターを生成）
        scene.add('invade_wave_move_type', (time) => {
            // シーンのフレーム数が 50 で割り切れるときは敵キャラクターを配置する
            if(scene.frame % 50 === 0){
                // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
                for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
                    if(enemyArray[i].life <= 0){
                        let e = enemyArray[i];
                        // ここからさらに２パターンに分ける
                        // frame が 200 以下かどうかで分ける
                        if(scene.frame <= 200){
                            // 左側を進む
                            e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave');
                        }else{
                            // 右側を進む
                            e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave');
                        }
                        break;
                    }
                }
            }
            // シーンのフレーム数が 450 になったとき次のシーンへ
            if(scene.frame === 450){
                scene.use('invade_large_type');
            }
            // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
            if(viper.life <= 0){
                scene.use('gameover');
            }
        });
        // invade シーン（large type の敵キャラクターを生成）
        scene.add('invade_large_type', (time) => {
            // シーンのフレーム数が 100 になった際に敵キャラクター（大）を配置する
            if(scene.frame === 100){
                // ライフが 0 の状態の敵キャラクター（大）が見つかったら配置する
                let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
                for(let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j){
                    if(enemyArray[j].life <= 0){
                        let e = enemyArray[j];
                        // 画面中央あたりから出現しライフが多い
                        e.set(CANVAS_WIDTH / 2, -e.height, 50, 'large');
                        break;
                    }
                }
            }
            // シーンのフレーム数が 500 になったとき intro へ
            if(scene.frame === 500){
                scene.use('intro');
            }
            // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
            if(viper.life <= 0){
                scene.use('gameover');
            }
        });
        // ゲームオーバーシーン
        // ここでは画面にゲームオーバーの文字が流れ続けるようにする
        scene.add('gameover', (time) => {
            // 流れる文字の幅は画面の幅の半分を最大の幅とする
            let textWidth = CANVAS_WIDTH / 2;
            // 文字の幅を全体の幅に足し、ループする幅を決める
            let loopWidth = CANVAS_WIDTH + textWidth;
            // フレーム数に対する除算の剰余を計算し、文字列の位置とする
            let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
            // 文字列の描画
            ctx.font = 'bold 72px sans-serif';
            util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
            // 再スタートのための処理
            if(restart === true){
                // 再スタートフラグはここでまず最初に下げておく
                restart = false;
                // スコアをリセットしておく
                gameScore = 0;
                // 再度スタートするための座標等の設定
                viper.setComing(
                    CANVAS_WIDTH / 2,   // 登場演出時の開始 X 座標
                    CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
                    CANVAS_WIDTH / 2,   // 登場演出を終了とする X 座標
                    CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
                );
                // シーンを intro に設定
                scene.use('intro');
            }
        });
        // 一番最初のシーンには intro を設定する
        scene.use('intro');
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を暗いネイビーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // スコアの表示
        ctx.font = 'bold 24px monospace';
        util.drawText(zeroPadding(gameScore, 5), 30, 50, '#ffffff');

        // シーンを更新する
        scene.update();

        // 流れる星の状態を更新する
        backgroundStarArray.map((v) => {
            v.update();
        });

        // 自機キャラクターの状態を更新する
        viper.update();

        // 敵キャラクターの状態を更新する
        enemyArray.map((v) => {
            v.update();
        });

        // ショットの状態を更新する
        shotArray.map((v) => {
            v.update();
        });

        // シングルショットの状態を更新する
        singleShotArray.map((v) => {
            v.update();
        });

        // 敵キャラクターのショットの状態を更新する
        enemyShotArray.map((v) => {
            v.update();
        });

        // 爆発エフェクトの状態を更新する
        explosionArray.map((v) => {
            v.update();
        });

        // 恒常ループのために描画処理を再帰呼出しする
        requestAnimationFrame(render);
    }

    /**
     * 度数法の角度からラジアンを生成する
     * @param {number} degrees - 度数法の度数
     */
    function degreesToRadians(degrees){
        return degrees * Math.PI / 180;
    }

    /**
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲（0 以上 ～ range 未満）
     */
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }

    /**
     * 数値の不足した桁数をゼロで埋めた文字列を返す
     * @param {number} number - 数値
     * @param {number} count - 桁数（２桁以上）
     */
    function zeroPadding(number, count){
        // 配列を指定の桁数分の長さで初期化する
        let zeroArray = new Array(count);
        // 配列の要素を '0' を挟んで連結する（つまり「桁数 - 1」の 0 が連なる）
        let zeroString = zeroArray.join('0') + number;
        // 文字列の後ろから桁数分だけ文字を抜き取る
        return zeroString.slice(-count);
    }
})();
