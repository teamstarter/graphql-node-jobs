"use strict";
exports.__esModule = true;
exports.workerSuccessRating = void 0;
function workerSuccessRating(models) {
    return {
        model: models.workerSuccessRating,
        actions: ['list', 'count']
    };
}
exports.workerSuccessRating = workerSuccessRating;
