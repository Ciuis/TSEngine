
namespace TSEngine {


    /**
     * Two component vector (x, y).
     */
    export class Vec2 {

        private _x: number;
        private _y: number;

        /**
         * Creates new vec2.
         * @param x The x component.
         * @param y The y component.
         */
        public constructor( x: number = 0, y: number = 0 ) {
            this._x = x;
            this._y = y;
        }

        public get x(): number {
            return this._x;
        }

        public set x( value: number ) {
            this._x = value;
        }

        public get y(): number {
            return this._y;
        }

        public set y( value: number ) {
            this._y = value;
        }

        public toArray(): number[] {
            return [this._x, this._y];
        }

        public toFloat32Array(): Float32Array {
            return new Float32Array( this.toArray() );
        }
    }
}