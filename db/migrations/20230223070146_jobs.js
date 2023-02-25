
exports.up = function(knex) {
    return knex.schema.createTable('jobs', function (table) {
        table.string('jobId').primary().notNull();
        table.string('source');
        table.string('originUrl');
        table.string('title',3000);
        table.string('body', 30000);
        table.string('publishedBy');
        table.string('salary');
        table.string('position');
        table.json('positionType');
        table.string('images', 3000);
        table.json('benefits', 3000);
        table.string('publishedDate');
        table.string('status');
        table.json('location', 3000);
        table.json('phoneNumber');
        table.json('replyEmail');
        table.json('responsibilities', 3000);
        table.string('companyName');
        table.string('companyWorkingHour');
        table.string('companyLogo', 3000);
        table.string('jobPostRawHtml', 30000);
      })
};


exports.down = function(knex) {
    return knex.schema.dropTable('jobs')
};
