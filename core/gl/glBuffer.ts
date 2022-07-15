namespace TSEngine {

    /**
     * Provides info for GLBuffer attribute.
     */
    export class AttribInfo {

        /**
         * The location of attribute.
         */
        public loc: number;

        /**
         * The size (number of elements, i.e. Vec3 = 3).
         */
        public size: number;

        /**
         * The number of elements from beginning of buffer.
         */
        public offset: number;
    }

    export class GLBuffer {

        private _hasAttribLocation: boolean = false;
        private _elementSize: number;
        private _stride: number;
        private _buffer: WebGLBuffer;

        private _targetBufferType: number;
        private _dataType: number;
        private _mode: number;
        private _typeSize: number;

        private _data: number[] = [];
        private _attribs: AttribInfo[] = [];

        /**
         * Creates a new GL buffer.
         * @param elementSize The size of each element in buffer.
         * @param dataType The datatype of buffer (gl.FLOAT by default).
         * @param targetBufferType The buffer target type. Can be gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER (gl.ARRAY_BUFFER by default).
         * @param mode The drawing mode. Can be gl.TRIANGLES or gl.LINES (gl.TRIANGLES by default).
         */
        public constructor( elementSize: number,
                            dataType: number = gl.FLOAT,
                            targetBufferType: number = gl.ARRAY_BUFFER,
                            mode: number = gl.TRIANGLES ) {
            this._elementSize = elementSize;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;

            //determine byte size
            switch ( this._dataType ) {
                case gl.FLOAT:
                case gl.INT:
                case gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case gl.SHORT:
                case gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case gl.BYTE:
                case gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognized data type: " + dataType.toString() );
            }

            this._stride = this._elementSize * this._typeSize;
            this._buffer = gl.createBuffer();
        }

        /**
         * Destructor.
         */
        public destroy(): void {
            gl.deleteBuffer( this._buffer );
        }

        /**
         * Buffer binding
         * @param isNormalized Shows if the data should be normalized (false by default).
         */
        public bind( isNormalized: boolean = false ): void {
            gl.bindBuffer( this._targetBufferType, this._buffer );

            if ( this._hasAttribLocation ) {
                for ( let it of this._attribs ) {
                    gl.vertexAttribPointer( it.loc, it.size, this._dataType, isNormalized, this._stride, it.offset * this._typeSize );
                    gl.enableVertexAttribArray( it.loc );
                }
            }
        }

        /**
         * Unbind buffer.
         */
        public unbind(): void {
            for ( let it of this._attribs ) {
                gl.enableVertexAttribArray( it.loc );
            }

            gl.bindBuffer( gl.ARRAY_BUFFER, this._buffer );
        }

        /**
         * Add an attribute with provided info to buffer.
         * @param info Info to be added.
         */
        public addAttribLocation( info: AttribInfo ): void {
            this._hasAttribLocation = true;
            this._attribs.push( info );
        }

        /**
         * Add data to buffer.
         * @param data
         */
        public pushBackData ( data: number[] ): void {
            for ( let d of data ) {
                this._data.push( d );
            }
        }

        /**
         * Upload buffer's data to GPU.
         */
        public upload(): void {
            gl.bindBuffer( this._targetBufferType, this._buffer );

            let bufferData: ArrayBuffer;

            switch ( this._dataType ) {
                case gl.FLOAT:
                    bufferData = new Float32Array( this._data );
                    break;
                case gl.INT:
                    bufferData = new Int32Array( this._data );
                    break;
                case gl.UNSIGNED_INT:
                    bufferData = new Uint32Array( this._data );
                    break;
                case gl.SHORT:
                    bufferData = new Int16Array( this._data );
                    break;
                case gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array( this._data );
                    break;
                case gl.BYTE:
                    bufferData = new Int8Array( this._data );
                    break;
                case gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array( this._data );
                    break;
            }

            gl.bufferData( this._targetBufferType, bufferData, gl.STATIC_DRAW );
        }

        /**
         * Draws buffer
         */
        public draw(): void {
            if (this._targetBufferType === gl.ARRAY_BUFFER ) {
                gl.drawArrays( this._mode, 0, this._data.length / this._elementSize );
            } else if ( this._targetBufferType === gl.ELEMENT_ARRAY_BUFFER ) {
                gl.drawElements( this._mode, this._data.length, this._dataType, 0 );
            }
        }
    }
}