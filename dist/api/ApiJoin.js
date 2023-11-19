"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiJoin = void 0;
const __1 = require("..");
async function ApiJoin(call) {
    let playerId = __1.roomInstance.join(call.req, call.conn);
    call.succ({
        playerId: playerId,
        gameState: __1.roomInstance.gameSystem.state
    });
}
exports.ApiJoin = ApiJoin;
