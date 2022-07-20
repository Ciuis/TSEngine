
namespace TSEngine {

    export const MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";

    /**
     * Manage assets into engine.
     */
    export class AssetManager {
        private static _loaders: IAssetLoader[] = [];
        private static _loadedAssets: { [name: string]: IAsset } = {};

        /** Private to enforce static method calls and prevent instantiation. */
        private constructor() {
        }

        /** Initialize manager */
        public static init(): void {
            AssetManager._loaders.push( new ImageAssetLoader() );
        }

        /**
         * Register provided loader with asset manager.
         * @param loader The loader to register.
         */
        public static registerLoader ( loader: IAssetLoader ): void {
            AssetManager._loaders.push( loader );
        }

        /** Callback made on asset loader when asset is loaded. */
        public static onAssetLoaded( asset: IAsset ): void {
            AssetManager._loadedAssets[asset.name] = asset;
            Message.send( MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset );
        }

        /**
         * Attempts to load asset using a registered asset loader.
         * @param assetName The name/url of asset to be loaded.
         */
        public static loadAsset( assetName: string ): void {
            let extension = assetName.split('.').pop().toLowerCase();
            for ( let l of AssetManager._loaders ) {
                if ( l.supportedExtensions.indexOf( extension ) !== -1) {
                    l.loadAsset( assetName );
                    return;
                }
            }

            console.warn( "Unable to load asset with extension " + extension + " because there is no loader associated with it." );
        }

        /**
         * Indicates if an asset with provided name has been loaded.
         * @param assetName The name to check.
         */
        public static isAssetLoaded( assetName:string ): boolean {
            return AssetManager._loadedAssets[assetName] !== undefined;
        }

        public static getAsset( assetName: string ): IAsset {
            if ( AssetManager._loadedAssets[assetName] !== undefined ) {
                return AssetManager._loadedAssets[assetName];
            } else {
                AssetManager.loadAsset( assetName );
            }

            return undefined;
        }
    }
}