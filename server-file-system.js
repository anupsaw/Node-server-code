var express = require('express')
var router = express.Router();
var fs = require('fs');
var path = require('path');
var q = require('q');

var success;
var error;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now())
    console.log(res)
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Max-Age',86400);

    
    //console.log(req);

    success = function (_res) {
        res.statusCode = req.method === 'POST' ? 201 : req.method === 'DELETE' ? 204 : 200;
        res.setHeader('Content-Type', 'x-www-form-urlencoded');
        res.write(JSON.stringify(_res.data));
        res.end();
    }

    error = function (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.write(err);
        res.end();
    }
    next();

})
// define the home page route
router.get('/:entity/:id', function (req, res) {
    getData(req.params.entity, req.params.id)
        .then(success, error);

})

router.get('/:entity', function (req, res, next) {
    getData(req.params.entity)
        .then(success, error);

})
// define the about route
router.post('/:entity', function (req, res) {
    insertData(req.params.entity, req.body)
        .then(success, error);
})

router.put('/:entity/:id', function (req, res) {
    updateData(req.params.entity, req.params.id, req.body)
        .then(success, error);
})

router.delete('/:entity/:id', function (req, res) {
    deleteData(req.params.entity, req.params.id)
        .then(success, error);
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
            defer.resolve({ file: _fileName, data: [] });

        } else {

            if (id !== null && id !== undefined) {
                data = JSON.parse(data);
                _res = data.find(function (item) {
                    return item.id === +id;
                })
                _res = _res === undefined ? defer.reject('No Data found.') : _res;
            } else {
                _res = JSON.parse(data);
            }

            defer.resolve({ file: _fileName, data: _res });
        }
    });
    return defer.promise;
}



function insertData(entity, data) {
    var defer = q.defer();
    getData(entity).then(function (_res) {
        //_data = JSON.parse(_res.data);
        _data = _res.data;
        if (Array.isArray(_data)) {
            data.id = _data.length + 1;
            _data.push(data);
        }else{
            defer.reject("Object type is not array");
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve({ data: data });
        })


    }, function (err) {
        defer.reject(err);
    });

    return defer.promise;


}




function updateData(entity, id, data) {

    var defer = q.defer();
    var _updatedData
    getData(entity).then(function (_res) {
        // _data = JSON.parse(_res.data);
        _data = _res.data;
        if (Array.isArray(_data)) {
            _data.forEach(function (item, index) {
                if (item.id === +id) {
                    for (var key in data) {
                        item[key] = data[key];
                    }
                    _updatedData = item;
                    // break;
                }
            })
        }else{
            defer.reject("Object type is not array");
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve({ data: _updatedData });
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
        // _data = JSON.parse(_res.data);
        _data = _res.data;
        if (Array.isArray(_data)) {
            for (var i = 0; i < _data.length; i++) {
                if (_data[i].id === +id) {
                    _deletedData = _data.splice(i, 1);
                    break;
                }


            }
        }else{
            defer.reject("Object type is not array");
        }

        _data = JSON.stringify(_data);

        writeDataToFile(_res.file, _data).then(function () {
            defer.resolve({ data: _deletedData });
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
