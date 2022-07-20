
namespace TSEngine {


    export interface IMessageHandler {

        onMessage( message: Message ): void;
    }
}