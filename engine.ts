
namespace TSEngine {

    /**
     * The main game engine class.
     */

    export class Engine {

        private _canvas: HTMLCanvasElement;

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

            gl.clearColor( 0, 0, 0, 1 );

            this.mainLoop();
        }

        private mainLoop(): void {
            gl.clear( gl.COLOR_BUFFER_BIT );

            requestAnimationFrame( this.mainLoop.bind( this ) );
        }
    }

}