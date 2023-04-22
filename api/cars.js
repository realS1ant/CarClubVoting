const qrcode = require('qrcode');
const PDFKit = require('pdfkit');
const fs = require('fs');
const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const Car = require('../models/Car.js');

router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user['admin']) {
        next();
    } else {
        res.status(401);
    }
});

//Create a car obj
router.post('/', async (req, res, next) => {
    const { make, model, year, owner, searchPhrase } = req.body;
    if (!(make && model && year && owner)) {
        console.log(req.body);
        res.status(400).json({ success: false, message: "Invalid Input(make, model, year, and owner)." });
        return;
    }

    if (searchPhrase) {
        const car = await Car.findOne({ searchPhrase: searchPhrase.toLowerCase() }).exec();
        if (car) {
            res.status(409).json({
                success: false,
                message: 'Search Phrase already in use!'
            });
            return;
        } else {
            const newCar = await new Car({
                make,
                model,
                year,
                owner,
                searchPhrase: searchPhrase.toLowerCase()
            }).save();
            res.status(201).json({ success: true, message: 'Car successfully created.', car: newCar });
        }
    } else {
        const car = await new Car({
            make,
            model,
            year,
            owner,
        }).save();
        res.status(201).json({ success: true, message: 'Car successfully created.', car });
        return;
    }
});

router.get('/highestvotes', async (req, res, next) => {
    if (!(req.isAuthenticated() && req.user['admin'])) {
        res.status(401).json({
            message: 'Unauthorized'
        });
        return;
    }

    const cars = (await Car.find().sort({ 'votes': -1 }).limit(3));
    res.status(200).json({
        cars
    });
});

//api/cars/multipage?ids=12987sd;122dsabn;3asdea
router.get('/multipage', async (req, res) => {
    let { ids } = req.query;

    if (!ids || ids.length == 0) {
        res.status(400).json({ message: 'No IDs specified.' })
        return;
    }

    let cars = await Promise.all(ids.split(';').map(carId => {
        let car;
        try {
            car = Car.findById(carId).exec()
        } catch {
            res.status(400).json({ message: 'No IDs specified.' })
            return;
        }

        return car;
    }));

    let pdf = new PDFKit({ bufferPages: true });
    // pdf.pipe(fs.createWriteStream(`qrcodes/balls.pdf`));

    let buffers = [];
    pdf.on('data', buffers.push.bind(buffers));
    pdf.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(pdfData),
            'Content-Type': 'application/pdf',
            'Content-disposition': `attachment;filename=Multipage-${cars.length}.pdf`
        }).end(pdfData);
    });

    for await (const car of cars) {
        if (car == null) return;

        //async callback, inside of sync function, inside of for await of, hell.
        await new Promise(async (resolve, reject) => {
            fs.stat(`./qrcodes/${car.id}.png`, async (err, stats) => {
                if (err || stats.size == 0) {
                    //doesn't exist, create
                    await qrcode.toFile(`./qrcodes/${car.id}.png`, `${process.env.HOSTNAME || 'https://sluhcarclub.com'}/car/${car.searchPhrase ? car.searchPhrase : car.id}`);
                }
                let isUnregistered = car.owner.toLowerCase().includes("unregistered");
                if (!isUnregistered) {
                    pdf.fontSize(36).text(`${car.owner}'s`, pdf.x, pdf.y, {
                        align: 'center'
                    });
                    pdf.fontSize(30).text(`${car.year} ${car.make} ${car.model}`, pdf.x, pdf.y, {
                        align: 'center'
                    });
                }

                pdf.image(`qrcodes/${car.id}.png`, (pdf.page.width - 164) / 2, pdf.y, {
                    fit: [164, 164]
                });
                pdf.fontSize(8).text(`${process.env.HOSTNAME || 'https://sluhcarclub.com'}/car/${car.searchPhrase ? car.searchPhrase : car.id}`, pdf.x, pdf.y, {
                    align: 'center'
                });
                if (isUnregistered) {
                    pdf.fontSize(8).text(car.owner, pdf.x, pdf.y, {
                        align: 'center'
                    });
                }
                if (cars.indexOf(car) != cars.length - 1) pdf.addPage();
                resolve();
            });
        });
    };
    pdf.remove
    pdf.end();
});

router.get('/cars', async (req, res) => {
    let { results, page } = req.query;

    results = +results;
    page = +page;

    if (!results) results = 20;
    if (!page) page = 1;

    let filter = req.query['archive'] != undefined && req.query['archive'] ? { archived: true } : { archived: { $ne: true } };

    let cars = await Car.find(filter).sort({ created_at: -1 }).skip((page - 1) * results).limit(results).exec();
    res.json({ cars, page });
});

router.get('/clearvotes', async (req, res) => {
    let { ids } = req.query;

    if (!ids) {
        res.status(400).json({ message: 'No IDs specified.' })
        return;
    }

    let carIds = await Promise.all(ids.split(';'));

    if (carIds.length == 0) {
        res.status(400).json({ message: 'No IDs specified.' })
        return;
    }

    let query = await Car.updateMany({ '_id': { $in: carIds } }, { votes: 0 }).exec();

    res.status(200).json({ message: `Reset votes of specified vehicles.` })
});

router.get('/archive', async (req, res) => {
    let { ids } = req.query;

    if (!ids) {
        res.status(400).json({ message: 'No IDs specified.' })
        return;
    }

    let carIds = ids.includes(';') ? await Promise.all(ids.split(';')) : [ids];

    if (carIds.length == 0) {
        res.status(400).json({ message: 'No IDs specified.' })
        return;
    }

    let set = req.query['unarchive'] != undefined && req.query['unarchive'] ? { archived: false } : { archived: true };

    let query = await Car.updateMany({ '_id': { $in: carIds } }, set).exec();

    res.status(200).json({ message: `Archived all specified vehicles.` })
});

//Get Car by id
router.get('/:query', async (req, res) => {
    const { query } = req.params;

    if (!query) {
        res.status(400).json({
            success: false,
            message: 'Invalid Query',
            car: {}
        });
    }

    // if (!carId || !isValidObjectId(query)) {
    //     res.status(400).json({
    //         success: false,
    //         message: 'Invalid Car Id',
    //         car: {}
    //     });
    //     return;
    // }

    if (isValidObjectId(query)) {
        try {
            const car = await Car.findById(query).exec();
            if (car) {
                res.status(200).json({
                    success: true,
                    car
                });
            } else {
                //204 no content
                res.status(204).json({
                    success: false,
                    message: 'No car found'
                });
            }
            return;
        } catch (e) {
            console.log('Error fetching car by ID: ' + query);
            res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
            return;
        }
    } else {
        try {
            const car = await Car.findOne({ searchPhrase: query.toLowerCase() }).exec();
            if (car) {
                res.status(200).json({
                    success: true,
                    car
                });
            } else {
                //204 no content
                res.status(204).json({
                    success: false,
                    message: 'No car found'
                });
            }
            return;
        } catch (e) {
            console.log('Error fetching car by ID: ' + query);
            res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
            return;
        }
    }
});

//Update Car
router.put('/:query', async (req, res) => {
    const { query } = req.params;
    const { make, model, year, owner, votes, searchPhrase } = req.body;

    if (!query || !(make || model || year || owner || votes || searchPhrase)) {
        res.status(400).json({
            success: false,
            message: 'Invalid Car Id or body'
        });
        return;
    }

    if (isValidObjectId(query)) {
        const car = await Car.findByIdAndUpdate(query, req.body);

        if (car == null) {
            res.status(400).json({
                success: false,
                message: 'Incorrect Car Id'
            });
            return;
        }

        res.status(200).json({
            message: 'Successfully updated',
            car
        });
        return;
    } else {
        const car = await Car.findOneAndUpdate({ searchPhrase: query.toLowerCase() }, req.body);

        if (car == null) {
            res.status(400).json({
                success: false,
                message: 'Incorrect Car Id'
            });
            return;
        }

        res.status(200).json({
            message: 'Successfully updated',
            car
        });
        return;
    }
});

router.delete('/:query', async (req, res) => {
    const { query } = req.params;

    if (!query) {
        res.status(400).json({
            success: false,
            message: 'Invalid Query'
        });
        return;
    }
    if (isValidObjectId(query)) {
        const car = await Car.findByIdAndRemove(query);
        if (car == null) {
            //Car not found
            res.status(204).json({
                success: false,
                message: 'No car found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            car
        });
        return;
    } else {
        const car = await Car.findOneAndRemove({ searchPhrase: query.toLowerCase() });
        if (car == null) {
            //Car not found
            res.status(204).json({
                success: false,
                message: 'No car found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            car
        });
        return;
    }
});

router.get('/qrcode/:query', async (req, res) => {
    const { query } = req.params;

    if (!query) {
        res.status(400).json({
            success: false,
            message: 'Invalid Query'
        });
        return;
    }
    let car;
    if (isValidObjectId(query)) {
        car = await Car.findById(query);
    } else {
        car = await Car.findOne({ searchPhrase: query });
    }

    if (!car) {
        res.sendStatus(400);
        return null;
    }

    fs.stat(`./qrcodes/${car.id}.png`, async (err, stats) => {
        if (err) {
            //doesn't exist, create
            await qrcode.toFile(`./qrcodes/${car.id}.png`, `${process.env.HOSTNAME || 'https://sluhcarclub.com'}/car/${car.searchPhrase ? car.searchPhrase : car.id}`);
        }

        let pdf = new PDFKit({ bufferPages: true });

        let buffers = [];
        pdf.on('data', buffers.push.bind(buffers));
        pdf.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(pdfData),
                'Content-Type': 'application/pdf',
                'Content-disposition': `attachment;filename=${car.id}.pdf`
            }).end(pdfData);
        });
        // pdf.pipe(fs.createWriteStream(`qrcodes/${query}.pdf`));
        pdf.fontSize(36).text(`${car.owner}'s`, pdf.x, pdf.y, {
            align: 'center'
        });
        pdf.fontSize(30).text(`${car.year} ${car.make} ${car.model}`, pdf.x, pdf.y, {
            align: 'center'
        });
        pdf.image(`qrcodes/${car.id}.png`, (pdf.page.width - 164) / 2, pdf.y, {
            fit: [164, 164]
        });
        pdf.fontSize(8).text(`${process.env.HOSTNAME || 'https://sluhcarclub.com'}/car/${query}`, pdf.x, pdf.y, {
            align: 'center'
        });
        pdf.end();

        fs.unlink(`./qrcodes/${car.id}.png`, err => {
            if (err) console.error(err);
        });
    });
});

module.exports = router;