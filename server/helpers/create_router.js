const express = require('express');
const ObjectID = require('mongodb').ObjectID;

const createRouter = function (collection) {
    const router = express.Router();

    // INDEX
    router.get('/', (req, res) => {
        collection
            .find()
            .toArray()
            .then((docs) => {
                res.json(docs)
            })
            .catch((error) => {
                console.error(error);
            });
    })

    // INDEX BY DATE
    router.get('/:date', (req, res) => {
        const date = req.params.date;
        collection
            .find({ date: date })
            .toArray()
            .then((docs) => {
                res.json(docs)
            })
            .catch((error) => {
                console.error(error);
            });
    })

    // SHOW
    router.get('/:id', (req, res) => {
        const id = req.params.id;
        collection
            .find({ _id: ObjectID(id) })
            .toArray()
            .then((doc) => {
                res.json(doc)
            })
            .catch((error) => {
                console.error(error)
            });
    })

    // CREATE
    router.post('/:date', (req, res) => {
        const newData = req.body;
        const date = req.body.date;
        collection
            .insertOne(newData)
            .then(() => {
                collection
                    .find({ date: date })
                    .toArray()
                    .then((docs) => {
                        res.json(docs)
                    })
            })
            .catch((error) => {
                console.error(error)
            })
    })

    // UPDATE
    router.put('/:id/:date', (req, res) => {
        const id = req.params.id;
        const updatingItem = req.body;
        const date = req.params.date;
        collection.updateOne(
            { _id: ObjectID(id) },
            { $set: updatingItem }
        )
            .then(() => {
                collection
                    .find({ date: date })
                    .toArray()
                    .then((docs) => {
                        res.json(docs)
                    })
            })
            .catch((error) => {
                console.error(error)
            })
    })

    // DELETE
    router.delete('/:id/:date', (req, res) => {
        const id = req.params.id;
        const date = req.params.date;
        collection
            .deleteOne({ _id: ObjectID(id) })
            .then(() => collection.find({ date: date }).toArray())
            .then((docs) => res.json(docs))
            .catch((error) => {
                console.error(error)
            });
    });


    // DELETE ALL FOR DATE
    router.delete('/:date', (req, res) => {
        const date = req.params.date;
        collection.deleteMany({ date: date })
            .then(() => {
                collection
                    .find({ date: date })
                    .toArray()
                    .then((docs) => {
                        res.json(docs)
                    })
            })
            .catch((error) => {
                console.error(error)
            })
    })

    return router;
}

module.exports = createRouter;
