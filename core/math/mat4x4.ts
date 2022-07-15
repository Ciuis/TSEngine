
namespace TSEngine {


    export class Mat4x4 {


        private _data: number[] = [];

        private constructor() {
            this._data = [
                1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ];
        }

        public get data(): number[] {
            return this._data;
        }

        public static identity(): Mat4x4 {
            return new Mat4x4();
        }

        public static orthographic(  left: number,
                                     right: number,
                                     bottom: number,
                                     top: number,
                                     nearClip: number,
                                     farClip: number ): Mat4x4 {
            let m = new Mat4x4();

            let lr: number = 1.0 / ( left - right );
            let bt:number = 1.0 / ( bottom - top );
            let nf: number = 1.0 / ( nearClip - farClip );

            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[10] = 2.0 * nf;
            m._data[12] = ( left + right ) * lr;
            m._data[13] = ( top + bottom ) * bt;
            m._data[14] = ( farClip + nearClip ) * nf;

            return m;
        }

        public static translation( position: Vec3 ): Mat4x4 {
            let m = new Mat4x4();

            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;

            return m;
        }
    }
}