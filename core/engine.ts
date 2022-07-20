
namespace TSEngine {

    /**
     * The main game engine class.
     */
    export class Engine {

        private _canvas: HTMLCanvasElement;
        private _basicShader: BasicShader;
        private _projection: Mat4x4;

        private _sprite: Sprite;

        /**
         * Creates new engine.
         */
        public constructor() {
        }

        /**
         * Starts engine.
         */
        public start(): void {

            this._canvas = GLUtilities.init();
            AssetManager.init();

            gl.clearColor( 0, 0, 0, 1 );

            this._basicShader = new BasicShader();
            this._basicShader.use();

            //Load materials
            MaterialManager.registerMaterial( new Material( "crate", "assets/textures/crate.png", new Color(0, 128, 255, 255) ) );

            // Load
            this._projection = Mat4x4.orthographic( 0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0 );

            this._sprite = new Sprite( "test", "crate" );
            this._sprite.load();
            this._sprite.position.x = 200;
            this._sprite.position.y = 100;

            this.resize();
            this.mainLoop();
        }

        /**
         * Resizes the canvas to fit the window.
         */
        public resize(): void {
            if ( this._canvas !== undefined ) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;

                gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
                this._projection = Mat4x4.orthographic( 0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0 );

            }
        }

        private mainLoop(): void {
            MessageBus.update( 0 );

            gl.clear( gl.COLOR_BUFFER_BIT );

            // Set uniforms.
            let projectionPosition = this._basicShader.getUniformLocation( "u_projection" );
            gl.uniformMatrix4fv( projectionPosition, false, new Float32Array( this._projection.data ) );

            this._sprite.draw( this._basicShader );

            requestAnimationFrame( this.mainLoop.bind( this ) );
        }
    }
}