"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReaction = void 0;
const typeorm_1 = require("typeorm");
const ChatMessage_1 = require("./ChatMessage");
const User_1 = require("./User");
let MessageReaction = class MessageReaction {
};
exports.MessageReaction = MessageReaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], MessageReaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], MessageReaction.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ChatMessage_1.ChatMessage, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "messageId" }),
    __metadata("design:type", ChatMessage_1.ChatMessage)
], MessageReaction.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], MessageReaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], MessageReaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 5 }),
    __metadata("design:type", String)
], MessageReaction.prototype, "emoji", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MessageReaction.prototype, "createdAt", void 0);
exports.MessageReaction = MessageReaction = __decorate([
    (0, typeorm_1.Entity)("message_reactions"),
    (0, typeorm_1.Index)(["messageId", "userId", "emoji"], { unique: true })
], MessageReaction);
//# sourceMappingURL=MessageReaction.js.map