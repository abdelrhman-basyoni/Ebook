


let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

//Assertion Style
chai.should();

chai.use(chaiHttp);

describe('Tasks API', () => {

    /**
     * Test the GET route
     */
    describe("GET /api/tasks", () => {
        it("It should GET all the tasks", (done) => {
            chai.request(server)
                .get("/book/categories")
                .end((err, response) => {
                    response.should.have.status(200);
                   
                done();
                });
        });
    });
});
