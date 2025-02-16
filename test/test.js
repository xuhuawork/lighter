const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Lighter Tracking', () => {
    it('should submit a new entry', (done) => {
        chai.request(server)
            .post('/submit')
            .send({
                lighterNumber: 1,
                source: '测试来源',
                message: '测试留言',
                location: '测试地点'
            })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should get history for a lighter', (done) => {
        chai.request(server)
            .get('/api/history/1')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
}); 