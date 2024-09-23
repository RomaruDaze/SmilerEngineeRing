import cv2
import os
import json
import requests
from datetime import datetime
import time

def take_photo():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return {"status": "error", "message": "Could not open camera."}

    # Add a small delay to allow the camera to adjust to lighting conditions
    time.sleep(0.1)

    ret, frame = cap.read()
    if not ret:
        return {"status": "error", "message": "Could not read frame."}

    images_dir = os.path.join(os.path.dirname(__file__), 'images')
    os.makedirs(images_dir, exist_ok=True)
    photo_path = os.path.join(images_dir, 'photo.jpg')
    cv2.imwrite(photo_path, frame)
    cap.release()
    cv2.destroyAllWindows()

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Directly use the specified address
    location_address = "〒950-0917 Niigata, Chuo Ward, Tenjin, 1 Chome-1-3"

    return {
        "status": "success",
        "photo_path": photo_path,
        "time": current_time,
        "location": location_address
    }

if __name__ == "__main__":
    result = take_photo()
    print(json.dumps(result))
