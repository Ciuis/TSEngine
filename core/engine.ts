
namespace TSEngine {

    /**
     * The main game engine class.
     */

    export class Engine {

        private _canvas: HTMLCanvasElement;
        private _shader: Shader;

        private _buffer: GLBuffer;

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
            this.loadShaders();
            this._shader.use();
            this.createBuffer();

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

                gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            }
        }

        private mainLoop(): void {
            gl.clear( gl.COLOR_BUFFER_BIT );

            //Set uniforms
            let colorPosition = this._shader.getUniformLocation( "u_color" );
            gl.uniform4f( colorPosition, 1, 0.5, 0, 1);

            this._buffer.bind();
            this._buffer.draw();

            gl.drawArrays( gl.TRIANGLES, 0, 3 );

            requestAnimationFrame( this.mainLoop.bind( this ) );
        }

        private createBuffer(): void {
            this._buffer = new GLBuffer( 3 );

            let positionAttrib = new AttribInfo();
            positionAttrib.loc = this._shader.getAttribLocation( "a_position" );
            positionAttrib.offset = 0;
            positionAttrib.size = 3;
            this._buffer.addAttribLocation( positionAttrib );

            let vertices = [
                //x, y, z
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ];

            this._buffer.pushBackData( vertices );
            this._buffer.upload();
            this._buffer.unbind();
        }

        private loadShaders(): void {
            let vertexShaderSource = `
                        attribute vec3 a_position;
                          
                        void main() {
                            gl_Position = vec4(a_position, 1.0);
                        }`;
            let fragmentShaderSource = `
                        precision mediump float;
                        
                        uniform vec4 u_color;
                        
                        void main() {
                            gl_FragColor = u_color;
                        }`;
            this._shader = new Shader( "base", vertexShaderSource, fragmentShaderSource );
        }
    }
}