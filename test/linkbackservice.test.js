/* global describe, it, expect */

var $require = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var factory = require('../app/linkbackservice');
var Server = require('../lib/server');


describe('linkbackservice', function() {
  
  it('should export factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  it('should be annotated', function() {
    expect(factory['@singleton']).to.equal(true);
    expect(factory['@implements']).to.equal('http://schemas.modulate.io/js/social/notifications/LinkbackService');
  });
  
  describe('LinkbackService', function() {
    var ms = {
      publish: function(){}
    }
    
    
    describe('create', function() {
      var factory, ServerSpy;
      ServerSpy = sinon.spy(Server);
      factory = $require('../app/linkbackservice',
        { '../lib/server': ServerSpy });
    
      var service = factory(ms);
    
      it('should construct service', function() {
        expect(ServerSpy).to.have.been.calledOnce;
        expect(ServerSpy).to.have.been.calledWithExactly('https://pubsub.googleapis.com/v1/projects/undefined/topics/test-linkback', ms);
      });
    }); // create
    
    describe('#ping', function() {
      
      describe('successfully publishing message', function() {
        before(function() {
          sinon.stub(ms, 'publish').yields(null);
        });
      
        after(function() {
          ms.publish.restore();
        });
        
        before(function(done) {
          var service = factory(ms);
          service.ping('https://waterpigs.example/post-by-barnaby', 'https://aaronpk.example/post-by-aaron', function(err) {
            done(err);
          });
        });
        
        it('should publish message', function() {
          expect(ms.publish.callCount).to.equal(1);
          expect(ms.publish.args[0][0]).to.equal('https://pubsub.googleapis.com/v1/projects/undefined/topics/test-linkback');
          expect(ms.publish.args[0][1]).to.deep.equal({
            body: '{"source":"https://waterpigs.example/post-by-barnaby","target":"https://aaronpk.example/post-by-aaron"}'
          });
        });
        
      }); // successfully publishing message
      
    }); // #ping
    
  }); // LinkbackService
  
});
