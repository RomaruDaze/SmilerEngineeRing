import cv2
import os
import json
import base64
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

def save_photo(image_data):
    images_dir = os.path.join(os.path.dirname(__file__), 'images')
    os.makedirs(images_dir, exist_ok=True)
    photo_path = os.path.join(images_dir, 'photo.jpg')

    # Decode the base64 image data
    image_data = base64.b64decode(image_data.split(',')[1])
    with open(photo_path, 'wb') as f:
        f.write(image_data)

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    location_address = "〒950-0917 Niigata, Chuo Ward, Tenjin, 1 Chome-1-3"

    return {
        "status": "success",
        "photo_path": photo_path,
        "time": current_time,
        "location": location_address
    }

@app.route('/take_photo', methods=['POST'])
def take_photo():
    data = request.json
    image_data = data.get('image')
    if not image_data:
        return jsonify({"status": "error", "message": "No image data provided."})

    result = save_photo(image_data)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)