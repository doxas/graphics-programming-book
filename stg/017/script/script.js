
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
     * 敵キャラクターのインスタンス数
     * @type {number}
     */
    const ENEMY_MAX_COUNT = 10;
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
        }

        // 敵キャラクターを初期化する
        for(i = 0; i < ENEMY_MAX_COUNT; ++i){
            enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
            // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
            enemyArray[i].setShotArray(enemyShotArray);
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
            // 2 秒経過したらシーンを invade に変更する
            if(time > 2.0){
                scene.use('invade');
            }
        });
        // invade シーン
        scene.add('invade', (time) => {
            // シーンのフレーム数が 0 のときは敵キャラクターを配置する
            if(scene.frame === 0){
                // ライフが 0 の状態の敵キャラクターが見つかったら配置する
                for(let i = 0; i < ENEMY_MAX_COUNT; ++i){
                    if(enemyArray[i].life <= 0){
                        let e = enemyArray[i];
                        // 出現場所は X が画面中央、Y が画面上端の外側に設定する
                        // この敵キャラクターのライフを 2 に設定する
                        e.set(CANVAS_WIDTH / 2, -e.height, 2, 'default');
                        // 進行方向は真下に向かうように設定する
                        e.setVector(0.0, 1.0);
                        break;
                    }
                }
            }
            // シーンのフレーム数が 100 になったときに再度 invade を設定する
            if(scene.frame === 100){
                scene.use('invade');
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
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // シーンを更新する
        scene.update();

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
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲（0 以上 ～ range 未満）
     */
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }
})();
