var should = require('should');
var agni = require('../lib');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var moment = require('moment');

describe('Agni', function () {
  var dir = path.resolve(process.cwd(), './test/case');
  var dotAgniLocation = path.resolve(dir, '.agni');

  it('has dot agni location', function () {
    agni.hasDotAgni('./test/case').should.not.be.ok;
  });

  it('fire up the egine', function (done) {
    agni.up('./test/case', function(err) {
      should.not.exist(err);
      fs.existsSync(dotAgniLocation).should.be.ok;
      fs.existsSync(path.resolve(dotAgniLocation, 'templates')).should.be.ok;
      done();
    });
  });

  it('start up the structure', function (done) {
    agni.start('./test/case', 'new-structure', function(err) {
      should.not.exist(err);
      fs.existsSync(path.resolve(dir, 'new-structure')).should.be.ok;
      fs.existsSync(path.resolve(dir, 'new-structure/.agni')).should.be.ok;
      done();
    });
  });

  it('has dot agni location', function () {
    agni.hasDotAgni('./test/case').should.be.ok;
  });

  it('fail to create dot agni dir in an existing context with up', function (done) {
    agni.up('./test/case', function (err) {
      fs.existsSync(dotAgniLocation).should.be.ok;
      err.should.be.eql('.agni exists in the ' + dotAgniLocation.replace('/.agni', ''));
      done();
    });
  });

  it('create a module if not exists module dir or index file', function (done) {
    agni.createModule(dir, 'test-case', function (err, timestamp) {
      should.not.exist(err); 
      should.exist(timestamp);
      console.log(timestamp);
      fs.existsSync(path.resolve(dir, 'modules/index.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'modules/index.js'), 'utf-8').should.be.eql(
        '// file: modules/index.js\n' +
        'exports.test-case = require(\'./test-case\');\n'  
      );
      fs.existsSync(path.resolve(dir, 'modules/test-case.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'modules/test-case.js'), 'utf-8').should.be.eql(
        '// file: modules/test-case.js - created at ' + timestamp + '\n' + 
        'function test-caseHandler() {\n' +
        '  // start here with test-case.js\n' + 
        '}\n' +
        'module.exports = exports = test-caseHandler;\n' 
      );
      done();
    });
  });

  it('fail to create module file on the structure', function (done) {
    agni.createModule(dir, 'test-case', function (err, timestamp) {
      err.should.be.eql('Impossible to create the file on that structure, verify the modules/ directory.'); 
      should.exist(timestamp);
      done();
    });
  });

  it('create a module if exists module dir or index file', function (done) {
    agni.createModule(dir, 'test-another-case', function (err, timestamp) {
      should.not.exist(err); 
      should.exist(timestamp);
      console.log(timestamp);
      fs.existsSync(path.resolve(dir, 'modules/index.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'modules/index.js'), 'utf-8').should.be.eql(
        '// file: modules/index.js\n' +
        'exports.test-case = require(\'./test-case\');\n' + 
        'exports.test-another-case = require(\'./test-another-case\');\n'
      );
      fs.existsSync(path.resolve(dir, 'modules/test-another-case.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'modules/test-another-case.js'), 'utf-8').should.be.eql(
        '// file: modules/test-another-case.js - created at ' + timestamp + '\n' + 
        'function test-another-caseHandler() {\n' +
        '  // start here with test-another-case.js\n' + 
        '}\n' +
        'module.exports = exports = test-another-caseHandler;\n' 
      );
      done();
    });
  });

  it('create a middleware if not exists middleware dir or index file', function (done) {
    agni.createMiddleware(dir, 'test-case', function (err, timestamp) {
      should.not.exist(err); 
      should.exist(timestamp);
      console.log(timestamp);
      fs.existsSync(path.resolve(dir, 'middlewares/index.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'middlewares/index.js'), 'utf-8').should.be.eql(
        '// file: middlewares/index.js\n' +
        'exports.test-case = require(\'./test-case\');\n'  
      );
      fs.existsSync(path.resolve(dir, 'middlewares/test-case.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'middlewares/test-case.js'), 'utf-8').should.be.eql(
        '// file: middlewares/test-case.js - created at ' + timestamp + '\n' + 
        'function test-caseHandler(req, res, next) {\n' +
        '  // start here with test-case.js\n' + 
        '}\n' +
        'module.exports = exports = test-caseHandler;\n' 
      );
      done();
    });
  });

  it('fail to create middleware file on the structure', function (done) {
    agni.createMiddleware(dir, 'test-case', function (err, timestamp) {
      err.should.be.eql('Impossible to create the file on that structure, verify the middlewares/ directory.'); 
      should.exist(timestamp);
      done();
    });
  });

  it('create a middleware if exists middleware dir or index file', function (done) {
    agni.createMiddleware(dir, 'test-another-case', function (err, timestamp) {
      should.not.exist(err); 
      should.exist(timestamp);
      console.log(timestamp);
      fs.existsSync(path.resolve(dir, 'middlewares/index.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'middlewares/index.js'), 'utf-8').should.be.eql(
        '// file: middlewares/index.js\n' +
        'exports.test-case = require(\'./test-case\');\n' + 
        'exports.test-another-case = require(\'./test-another-case\');\n'
      );
      fs.existsSync(path.resolve(dir, 'middlewares/test-another-case.js')).should.be.ok;
      fs.readFileSync(path.resolve(dir, 'middlewares/test-another-case.js'), 'utf-8').should.be.eql(
        '// file: middlewares/test-another-case.js - created at ' + timestamp + '\n' + 
        'function test-another-caseHandler(req, res, next) {\n' +
        '  // start here with test-another-case.js\n' + 
        '}\n' +
        'module.exports = exports = test-another-caseHandler;\n' 
      );
      done();
    });
  });

  after(function () {
    exec('rm -rf ' + dotAgniLocation, console.log.bind(console));
    exec('rm -rf ' + dir + '/*', console.log.bind(console));
  });
});
