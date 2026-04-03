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
exports.MerchantSubscription = void 0;
// Merchant Subscription Entity (for seller recurring billing)
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let MerchantSubscription = class MerchantSubscription {
};
exports.MerchantSubscription = MerchantSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "stripePriceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["free", "starter", "pro", "enterprise"], default: "free" }),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "planName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["trialing", "active", "past_due", "canceled", "unpaid"], default: "trialing" }),
    __metadata("design:type", String)
], MerchantSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], MerchantSubscription.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], MerchantSubscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], MerchantSubscription.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MerchantSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MerchantSubscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.merchantSubscriptions),
    (0, typeorm_1.JoinColumn)({ name: "merchantId" }),
    __metadata("design:type", User_1.User)
], MerchantSubscription.prototype, "merchant", void 0);
exports.MerchantSubscription = MerchantSubscription = __decorate([
    (0, typeorm_1.Entity)("merchant_subscriptions")
], MerchantSubscription);
//# sourceMappingURL=MerchantSubscription.js.map