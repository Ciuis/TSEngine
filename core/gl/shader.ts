namespace TSEngine {

    /**
     * WebGL shader
     */
    export class Shader {

        private _name: string;
        private _program: WebGLProgram;
        private _attrib: { [name: string]: number } = {};
        private _uniforms: { [name: string]: WebGLUniformLocation } = {};

        /**
         * Creates new shader.
         * @param name The name of shader.
         * @param vertexSrc The source of vertex shader.
         * @param fragmentSrc The source of fragment shader.
         */
        public constructor( name: string, vertexSrc: string, fragmentSrc: string ) {
            let vertexShader = this.loadShader( vertexSrc, gl.VERTEX_SHADER );
            let fragmentShader = this.loadShader( fragmentSrc, gl.FRAGMENT_SHADER );

            this.createProgram( vertexShader, fragmentShader );

            this.detectAttributes();
            this.detectUniforms();

        }

        /**
         * Name of shader.
         */
        public get name(): string {
            return this._name;
        }

        /**
         * Use shader.
         */
        public use(): void {
            gl.useProgram( this._program );
        }

        /**
         * Gets location of attribute with provided name.
         * @param name The name of attribute whose location we retrieve.
         */
        public getAttribLocation( name: string ): number {
            if ( this._attrib[name] === undefined ) {
                throw new Error(`Unable find attribute named '${name}' in shader named '${this._name}'`);
            }

            return this._attrib[name];
        }

        /**
         * Gets location of uniform with provided name.
         * @param name The name of uniform whose location we retrieve.
         */
        public getUniformLocation( name: string ): WebGLUniformLocation {
            if ( this._uniforms[name] === undefined ) {
                throw new Error(`Unable find uniform named '${name}' in shader named '${this._name}'`);
            }

            return this._uniforms[name];
        }

        private loadShader( source: string, shaderType: number ): WebGLShader {
            let shader: WebGLShader = gl.createShader( shaderType );

            gl.shaderSource( shader, source );
            gl.compileShader( shader );
            let error = gl.getShaderInfoLog( shader );
            if ( error !== "" ) {
                throw new Error( "Error compiling shader '" + this._name + "' : " + error );
            }

            return shader;
        }

        private createProgram( vertexShader: WebGLShader, fragmentShader: WebGLShader ): void {
            this._program = gl.createProgram();

            gl.attachShader( this._program, vertexShader );
            gl.attachShader( this._program, fragmentShader );

            gl.linkProgram( this._program );

            let error = gl.getProgramInfoLog( this._program );
            if ( error !== "" ) {
                throw new Error( "Error linking shader '" + this._name + "' : " + error );
            }
        }

        private detectAttributes(): void {
            let attribCount = gl.getProgramParameter( this._program, gl.ACTIVE_ATTRIBUTES );

            for ( let i = 0; i < attribCount; ++i) {
                let info: WebGLActiveInfo = gl.getActiveAttrib( this._program, i );

                if ( !info ) {
                    break;
                }

                this._attrib[info.name] = gl.getAttribLocation( this._program, info.name );
            }
        }

        private detectUniforms(): void {
            let uniformCount = gl.getProgramParameter( this._program, gl.ACTIVE_UNIFORMS);

            for ( let i = 0; i < uniformCount; ++i) {
                let info: WebGLActiveInfo = gl.getActiveUniform( this._program, i );

                if ( !info ) {
                    break;
                }

                this._uniforms[info.name] = gl.getUniformLocation( this._program, info.name );
            }
        }
    }
}