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
exports.CustomerPurchase = void 0;
// Customer Purchase Entity (for one-time product purchases)
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let CustomerPurchase = class CustomerPurchase {
};
exports.CustomerPurchase = CustomerPurchase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["nfc_card", "ring", "other"] }),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CustomerPurchase.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "USD" }),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["pending", "succeeded", "failed", "cancelled"], default: "pending" }),
    __metadata("design:type", String)
], CustomerPurchase.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], CustomerPurchase.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerPurchase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerPurchase.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.customerPurchases),
    (0, typeorm_1.JoinColumn)({ name: "customerId" }),
    __metadata("design:type", User_1.User)
], CustomerPurchase.prototype, "customer", void 0);
exports.CustomerPurchase = CustomerPurchase = __decorate([
    (0, typeorm_1.Entity)("customer_purchases")
], CustomerPurchase);
//# sourceMappingURL=CustomerPurchase.js.map