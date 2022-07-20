
namespace TSEngine {


    /**
     * 2-d sprite to be drawn on the screen.
     */
    export class Sprite {

        private _name: string;
        private _width: number;
        private _height: number;

        private _buffer: GLBuffer;
        private _materialName: string;
        private _material: Material;

        /**
         * Position on the screen..
         */
        public position: Vec3 = new Vec3();

        /**
         * Creating new sprite.
         * @param name The name of sprite.
         * @param materialName The name of material to use in sprite.
         * @param width The width of sprite.
         * @param height The height of sprite.
         */
        public constructor( name: string, materialName: string, width: number = 100, height: number = 100 ) {
            this._name = name;
            this._width = width;
            this._height = height;
            this._materialName = materialName;
            this._material = MaterialManager.getMaterial( this._materialName );
        }

        public get name(): string {
            return this._name;
        }

        public destroy(): void {
            this._buffer.destroy();
            MaterialManager.releaseMaterial( this._materialName );
            this._material = undefined;
            this._materialName = undefined;
        }

        /**
         * Loading routines on sprite
         */
        public load(): void {
            this._buffer = new GLBuffer( 5 );

            let positionAttrib = new AttribInfo();
            positionAttrib.loc = 0;
            positionAttrib.offset = 0;
            positionAttrib.size = 3;
            this._buffer.addAttribLocation( positionAttrib );

            let texCoordAttrib = new AttribInfo();
            texCoordAttrib.loc = 1;
            texCoordAttrib.offset = 3;
            texCoordAttrib.size = 2;
            this._buffer.addAttribLocation( texCoordAttrib );

            let vertices = [
                //x, y, z       ,u, v
                0.0, 0.0, 0.0,  0.0, 0.0,
                0.0, this._height, 0.0, 0.0, 1.0,
                this._width, this._height, 0.0, 1.0, 1.0,

                this._width, this._height, 0.0, 1.0, 1.0,
                this._width, 0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0
            ];

            this._buffer.pushBackData( vertices );
            this._buffer.upload();
            this._buffer.unbind();
        }

        /**
         * Updates routines of sprite.
         * @param time The delta time in milliseconds since last update call.
         */
        public update( time: number ): void {

        }

        public draw( shader: Shader ): void {

            let modelLocation = shader.getUniformLocation( "u_model" );
            gl.uniformMatrix4fv( modelLocation, false, new Float32Array( Mat4x4.translation( this.position ).data ) );

            let colorLocation = shader.getUniformLocation( "u_tint" );
            gl.uniform4fv( colorLocation, this._material.tint.toFloat32Array() );

            if ( this._material.diffuseTexture !== undefined ) {
                this._material.diffuseTexture.activateAndBind( 0 );
                let diffuseLocation = shader.getUniformLocation( "u_diffuse" );
                gl.uniform1i( diffuseLocation, 0 );
            }

            this._buffer.bind();
            this._buffer.draw();
        }
    }
}