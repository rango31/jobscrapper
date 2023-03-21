
exports.up = function(knex) {
    return knex.schema.createTable('reviews', function (table) {
        table.string('reviewId').primary().notNull();
        table.string('reviewText');
        table.string('country');
        table.string('city');
        table.string('departmentName');
        table.string('hospital');
        table.string('salary');
        table.string('reviewScore');
        table.string('timePeriod');
      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('reviews')
};
