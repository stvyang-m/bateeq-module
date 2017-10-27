require("should");
const helper = require("../../../helper");

const DesignTrackingDesignManager = require("../../../../src/managers/manufacture/design-tracking-design-manager");
let manager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            manager = new DesignTrackingDesignManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should error when create with empty name", function (done) {
    manager.create({ name: "" })
        .then((id) => {
            done("Should not be able to create with empty name");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("name");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#02. should error when create with unknown designer", function (done) {
    manager.create({ designer: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with designer");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("designer");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#03. should error when create with unknown article category", function (done) {
    manager.create({ articleCategory: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with article category");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("articleCategory");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#04. should error when create with unknown article season", function (done) {
    manager.create({ articleSeason: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with unknown article season");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("articleSeason");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#05. should error when create with unknown article material composition", function (done) {
    manager.create({ articleMaterialComposition: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with unknown article material composition");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("articleMaterialComposition");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#06. should error when create with unknown article sub counter", function (done) {
    manager.create({ articleSubCounter: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with unknown article sub counter");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("articleSubCounter");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#07. should error when create with unknown article material", function (done) {
    manager.create({ articleMaterial: { _id: "" } })
        .then((id) => {
            done("Should not be able to create with unknown article material");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("articleMaterial");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#08. should error when create with empty close date", function (done) {
    manager.create({ closeDate: "" })
        .then((id) => {
            done("Should not be able to create with empty close date");
        })
        .catch((e) => {
            try {
                e.name.should.equal("ValidationError");
                e.should.have.property("errors");
                e.errors.should.instanceof(Object);
                e.errors.should.have.property("closeDate");
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

it("#09. should success when search with keyword", function (done) {
    manager.read({ keyword: "Design Status" })
        .then((e) => {
            e.should.have.property("data");
            e.data.should.instanceof(Array);
            done();
        })
        .catch((e) => {
            done(e);
        });
});