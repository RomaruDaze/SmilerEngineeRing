const express = require('express');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 5001; 

app.use(cors()); // Enable CORS for all routes

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

// Route to take a photo
app.post('/take_photo', (req, res) => {
  const scriptPath = path.join(__dirname, 'open_camera.py');
  const pythonPath = '/usr/local/bin/python3';
  const env = { ...process.env, PYTHONWARNINGS: 'ignore::UserWarning' };

  execFile(pythonPath, [scriptPath], { env }, (error, stdout, stderr) => {
    if (error) {
      console.error('Subprocess error:', error);
      console.error(stderr);
      return res.status(500).json({ status: 'error', message: error.message });
    }

    try {
      const output = JSON.parse(stdout);
      if (output.status === 'success') {
        const photoPath = output.photo_path;
        fs.readFile(photoPath, (err, data) => {
          if (err) {
            console.error('Error reading photo file:', err);
            return res.status(500).json({ status: 'error', message: 'Error reading photo file' });
          }
          const photoBlob = data.toString('base64');
          return res.json({
            status: 'success',
            photo_blob: photoBlob,
            time: output.time,
            location: output.location
          });
        });
      } else {
        console.error('Error: Photo not taken.');
        console.error(stdout);
        console.error(stderr);
        return res.status(500).json({ status: 'error', message: 'Photo not taken' });
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(500).json({ status: 'error', message: 'Error parsing response' });
    }
  });
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