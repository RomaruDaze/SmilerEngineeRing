const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 5001;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

// Route to take a photo
app.post('/take_photo', (req, res) => {
    const scriptPath = path.join(__dirname, 'open_camera.py');
    const pythonPath = '/usr/local/bin/python3';
    const env = { ...process.env, PYTHONWARNINGS: 'ignore::UserWarning' };

    const imageData = req.body.image;
    if (!imageData) {
        return res.status(400).json({ status: 'error', message: 'No image data provided.' });
    }

    const spawn = require('child_process').spawn;
    const py = spawn(pythonPath, [scriptPath]);

    let dataString = '';

    py.stdout.on('data', function(data) {
        dataString += data.toString();
    });

    py.stdout.on('end', function() {
        try {
            const output = JSON.parse(dataString);
            if (output.status === 'success') {
                return res.json({
                    status: 'success',
                    photo_path: `/images/${path.basename(output.photo_path)}`,
                    time: output.time,
                    location: output.location
                });
            } else {
                return res.status(500).json({ status: 'error', message: 'Photo not taken' });
            }
        } catch (parseError) {
            return res.status(500).json({ status: 'error', message: 'Error parsing response' });
        }
    });

    py.stdin.write(JSON.stringify({ image: imageData }));
    py.stdin.end();
});

// Route to serve images
app.get('/images/:filename', (req, res) => {
    const options = {
        root: path.join(__dirname, 'images')
    };
    res.sendFile(req.params.filename, options, (err) => {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        }
    });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});