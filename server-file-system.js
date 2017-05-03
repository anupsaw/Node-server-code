var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');

var success;
var error

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    //console.log(req);
    success = function (data) {
        res.send(data);
    }
    next();

})
// define the home page route
router.get('/:entity/:id', function (req, res) {

    getData(req.params.entity, req.params.id)
        .then(function (res) {
            res.send(res.data);
        }, function (err) {
            res.send(err);
        });


})

router.get('/:entity', function (req, res) {
    getData(req.params.entity)
        .then(function (res) {
            res.send(res.data);
        }, function (err) {
            res.send(err);
        });

})
// define the about route
router.post('/:entity', function (req, res) {
    insertData(req.params.entity, req.body)
        .then(function (data) {
            res.send(data);
        }, function (err) {
            res.send(err);
        });
})

router.put('/:entity/:id', function (req, res) {
    updateData(req.params.entity, req.params.id, req.body)
        .then(function (data) {
            res.send(data);
        }, function (err) {
            res.send(err);
        });
})

router.delete('/:entity/:id', function (req, res) {
    deleteData(req.params.entity, req.params.id)
        .then(function (data) {
            res.send(data);
        }, function (err) {
            res.send(err);
        });
})



function getFileName(entity) {
    var _entity, _dir, _fileName;

    _entity = entity;
    _dir = path.join(__dirname, '/apidata/' + _entity + 's');
    _fileName = path.join(_dir, '/' + _entity + '.json');

    if (!fs.existsSync(_dir)) {
        fs.mkdirSync(_dir);
    }

    return _fileName;

}

function getData(entity, id) {
    var defer = q.defer();
    var _fileName = getFileName(entity);
    fs.readFile(_fileName, function (err, data) {
        var _res;
        if (err) {
            defer.resolve({ file: _fileName, data: '[]' });

        } else {

            if (id !== null && id !== undefined) {
                data = JSON.parse(data);
                _res = data.find(function (item) {
                    return item.id === +id;
                })
                _res = _res === undefined ? defer.reject('No Data found.') : JSON.stringify(_res);
            } else {
                _res = data;
            }

            defer.resolve({ file: _fileName, data: _res });
        }
    });
    return defer.promise;
}



function insertData(entity, data) {
    var defer = q.defer();
    getData(entity).then(function (_res) {
        _data = JSON.parse(_res.data);

        if (Array.isArray(_data)) {
            data.id = _data.length + 1;
            _data.push(data);
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve(data);
        })


    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;


}




function updateData(entity, id, data) {

    var defer = q.defer();
    getData(entity).then(function (_res) {
        _data = JSON.parse(_res.data);

        if (Array.isArray(_data)) {
            _data.forEach(function (item, index) {
                if (item.id === +id) {
                    for (var key in data) {
                        item[key] = data[key];
                    }
                    // break;
                }
            })
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve(true);
        })

    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;
}


function deleteData(entity, id) {
    var defer = q.defer();
    getData(entity).then(function (_res) {
        var _deletedData;
        _data = JSON.parse(_res.data);
        if (Array.isArray(_data)) {
            for (var i = 0; i < _data.length; i++) {
                if (_data[i].id === +id) {
                    _deletedData = _data.splice(i, 1);
                    break;
                }


            }
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve(_deletedData);
        })

    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;

}

function writeDataToFile(file, data) {
    var defer = q.defer();
    fs.writeFile(file, data, 'utf8', function (err) {
        if (err) {
            defer.reject(err)
        } else {
            defer.resolve(true);
        }

    });

    return defer.promise;
}




module.exports = router;
