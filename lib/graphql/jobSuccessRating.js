"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSuccessRating = jobSuccessRating;
function jobSuccessRating(models) {
    return {
        model: models.jobSuccessRating,
        actions: ['list', 'count'],
    };
}
