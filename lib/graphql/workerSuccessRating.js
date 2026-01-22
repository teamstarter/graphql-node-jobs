"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerSuccessRating = workerSuccessRating;
function workerSuccessRating(models) {
    return {
        model: models.workerSuccessRating,
        actions: ['list', 'count'],
    };
}
