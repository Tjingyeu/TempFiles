"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const gameConfig_1 = require("../shared/game/gameConfig");
const GameSystem_1 = require("../shared/game/GameSystem");
/**
 * 服务端 - 房间 - 逻辑系统
 */
class Room {
    constructor(server) {
        // 帧同步频率，次数/秒
        this.syncRate = gameConfig_1.gameConfig.syncRate;
        this.nextPlayerId = 1;
        this.gameSystem = new GameSystem_1.GameSystem();
        this.conns = [];
        this.pendingInputs = [];
        this.playerLastSn = {};
        this.server = server;
        setInterval(() => { this.sync(); }, 1000 / this.syncRate);
    }
    /** 加入房间 */
    join(req, conn) {
        let input = {
            type: 'PlayerJoin',
            playerId: this.nextPlayerId++,
            // 初始位置随机
            pos: {
                x: Math.random() * 10 - 5,
                y: Math.random() * 10 - 5
            }
        };
        this.applyInput(input);
        this.conns.push(conn);
        conn.playerId = input.playerId;
        conn.listenMsg('client/ClientInput', call => {
            this.playerLastSn[input.playerId] = call.msg.sn;
            call.msg.inputs.forEach(v => {
                this.applyInput({
                    ...v,
                    playerId: input.playerId
                });
            });
        });
        return input.playerId;
    }
    applyInput(input) {
        this.pendingInputs.push(input);
    }
    sync() {
        var _a;
        let inputs = this.pendingInputs;
        this.pendingInputs = [];
        // Apply inputs
        inputs.forEach(v => {
            this.gameSystem.applyInput(v);
        });
        // Apply TimePast
        let now = process.uptime() * 1000;
        this.applyInput({
            type: 'TimePast',
            dt: now - ((_a = this.lastSyncTime) !== null && _a !== void 0 ? _a : now)
        });
        this.lastSyncTime = now;
        // 发送同步帧
        this.conns.forEach(v => {
            v.sendMsg('server/Frame', {
                inputs: inputs,
                lastSn: this.playerLastSn[v.playerId]
            });
        });
    }
    /** 离开房间 */
    leave(playerId, conn) {
        this.conns.removeOne(v => v.playerId === playerId);
        this.applyInput({
            type: 'PlayerLeave',
            playerId: playerId
        });
    }
}
exports.Room = Room;
