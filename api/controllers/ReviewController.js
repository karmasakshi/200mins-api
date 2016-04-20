/**
 * ReviewController
 *
 * @description :: Server-side logic for managing reviews
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    create: function (req, res) {

        if (!req.body.hasOwnProperty('rating') || !req.body.hasOwnProperty('reaction') || req.body.hasOwnProperty('id')) {

            return res.badRequest();

        } else {

            var findReviewNeedle = {
                movie: req.body.movie,
                user: req.body.user
            };

            Review.findOne(findReviewNeedle).exec(function (err, foundReview) {

                if (err) {

                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                } else if (typeof foundReview !== 'undefined') {

                    return res.forbidden('You have already reviewed this movie. Please edit the original review.');

                } else {

                    var createReviewNeedle = {
                        movie: req.body.movie,
                        rating: req.body.rating,
                        reaction: req.body.reaction,
                        user: req.body.user
                    };

                    createReviewNeedle.comment = req.body.hasOwnProperty('comment') ? req.body.comment : null;

                    Review.create(createReviewNeedle).exec(function (err, createdReview) {

                        if (err) {

                            return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                        } else {

                            var code = 'r';

                            var createActivityNeedle = {
                                activity: {
                                    code: code,
                                    points: sails.config.ACTIVITIES[code].points,
                                    reference: createdReview.id,
                                    string: sails.config.ACTIVITIES[code].string
                                },
                                movie: createReviewNeedle.movie,
                                user: createReviewNeedle.user
                            };

                            Activity.create(createActivityNeedle).exec(function (err, createdActivity) {

                                if (err) {

                                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                                    // Bug: Activity not recorded

                                } else {

                                    return res.json(createdReview);

                                }

                            });

                        }

                    });

                }

            });

        }

    },

    update: function (req, res) {

        if (!req.body.hasOwnProperty('comment') || !req.body.hasOwnProperty('id') || !req.body.hasOwnProperty('rating') || !req.body.hasOwnProperty('reaction')) {

            return res.badRequest();

        } else {

            var findReviewNeedle = {
                id: req.body.id,
                user: req.body.user
            };

            Review.findOne(findReviewNeedle).exec(function (err, foundReview) {

                if (err) {

                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                } else if (typeof foundReview === 'undefined') {

                    return res.badRequest('Original review was not found.');

                } else {

                    var updatedReview = {
                        movie: req.body.movie,
                        rating: req.body.rating,
                        reaction: req.body.reaction,
                        comment: req.body.comment
                    };

                    Review.update(findReviewNeedle, updatedReview).exec(function (err, updatedReviews) {

                        if (err) {

                            return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                        } else {

                            var findActivityNeedle = {
                                activity: {
                                    code: 'r',
                                    reference: findReviewNeedle.id
                                },
                                user: findReviewNeedle.user
                            };

                            Activity.findOne(findActivityNeedle).exec(function (err, foundActivity) {

                                if (err) {

                                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                                    // Bug: Activity not recorded

                                } else {

                                    var date = (new Date()).toISOString();

                                    var updatedActivity = {
                                        updatedAt: date
                                    };

                                    Activity.update(findActivityNeedle, updatedActivity).exec(function (err, updatedActivities) {

                                        if (err) {

                                            return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                                            // Bug: Activity not recorded

                                        } else {

                                            return res.json(updatedReviews[0]);

                                        }

                                    });

                                }

                            });

                        }

                    });

                }

            });

        }

    },

    delete: function (req, res) {

        if (!req.body.hasOwnProperty('id')) {

            return res.badRequest();

        } else {

            var findReviewNeedle = {
                id: req.body.id,
                user: req.body.user
            };

            Review.findOne(findReviewNeedle).exec(function (err, foundReview) {

                if (err) {

                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                } else if (typeof foundReview === 'undefined') {

                    res.forbidden('Original review was not found.');

                } else {

                    Review.destroy(findReviewNeedle).exec(function (err) {

                        if (err) {

                            return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                        } else {

                            var findActivityNeedle = {
                                activity: {
                                    code: 'r',
                                    reference: findReviewNeedle.id
                                },
                                user: findReviewNeedle.user
                            };

                            Activity.destroy(findActivityNeedle).exec(function (err) {

                                if (err) {

                                    return sails.config.environment === 'development' ? res.serverError(err) : res.serverError();

                                    // Bug: Activity not recorded

                                } else {

                                    return res.ok();

                                }

                            });

                        }

                    });

                }

            });

        }

    }

};