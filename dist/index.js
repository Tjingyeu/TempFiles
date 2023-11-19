"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomInstance = exports.server = void 0;
require("k8w-extend-native");
const path = __importStar(require("path"));
const tsrpc_1 = require("tsrpc");
const Room_1 = require("./models/Room");
const serviceProto_1 = require("./shared/protocols/serviceProto");
// 创建 TSRPC WebSocket Server
exports.server = new tsrpc_1.WsServer(serviceProto_1.serviceProto, {
    port: 3000,
    json: true,
    heartbeatWaitTime: 10000,
    // Enable this to see send/recv message details
    logMsg: false,
});
// 断开连接后退出房间
exports.server.flows.postDisconnectFlow.push(v => {
    let conn = v.conn;
    if (conn.playerId) {
        exports.roomInstance.leave(conn.playerId, conn);
    }
    return v;
});
exports.roomInstance = new Room_1.Room(exports.server);
// 初始化
async function init() {
    // 挂载 API 接口
    await exports.server.autoImplementApi(path.resolve(__dirname, 'api'));
    // TODO
    // Prepare something... (e.g. connect the db)
}
;
// 启动入口点
async function main() {
    await init();
    await exports.server.start();
}
main();
