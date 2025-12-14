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
exports.WebhookDto = exports.UpdateSubscriptionDto = exports.CreateSubscriptionDto = exports.CreateCustomerDto = exports.CreateCheckoutSessionDto = exports.PlanType = void 0;
const class_validator_1 = require("class-validator");
var PlanType;
(function (PlanType) {
    PlanType["BASIC"] = "basic";
    PlanType["PRO"] = "pro";
    PlanType["PREMIUM"] = "premium";
})(PlanType || (exports.PlanType = PlanType = {}));
class CreateCheckoutSessionDto {
}
exports.CreateCheckoutSessionDto = CreateCheckoutSessionDto;
__decorate([
    (0, class_validator_1.IsEnum)(PlanType),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckoutSessionDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCheckoutSessionDto.prototype, "metadata", void 0);
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateCustomerDto.prototype, "metadata", void 0);
class CreateSubscriptionDto {
}
exports.CreateSubscriptionDto = CreateSubscriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PlanType),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "plan", void 0);
class UpdateSubscriptionDto {
}
exports.UpdateSubscriptionDto = UpdateSubscriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "subscriptionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PlanType),
    __metadata("design:type", String)
], UpdateSubscriptionDto.prototype, "newPlan", void 0);
class WebhookDto {
}
exports.WebhookDto = WebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookDto.prototype, "signature", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WebhookDto.prototype, "payload", void 0);
//# sourceMappingURL=payments.dto.js.map