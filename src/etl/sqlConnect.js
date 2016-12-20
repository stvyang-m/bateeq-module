
var sql = require("mssql");

var config = {

    user: 'adminbateeq',
    password: 'Standar123.',
    server: 'efrata.database.windows.net',
    database: 'efrata.pos',
    // database: 'testefrata',
    options: {
        encrypt: true
    },
    connectionTimeout: 100000,
    requestTimeout: 100000

};

module.exports = {
    getConnect: function () {
        return new Promise((resolve, reject) => {
            sql.connect(config, function (err) {
                resolve(new sql.Request());
            })
        });
    }
}
