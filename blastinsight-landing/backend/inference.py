from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best.pt"

IMGSZ = 768
CONF_RAW = 0.25
IOU = 0.70
MAX_DET = 1000

model = YOLO(str(MODEL_PATH))


def run_inference(image_path: str):
    """
    Menjalankan raw prediction YOLO11s-Seg.

    Confidence dibuat lebih rendah dari threshold QC 0.40,
    karena filtering final dilakukan di fragmentation.py.
    """

    results = model.predict(
        source=image_path,
        imgsz=IMGSZ,
        conf=CONF_RAW,
        iou=IOU,
        max_det=MAX_DET,
        retina_masks=False,
        save=False,
        verbose=False
    )

    if not results:
        raise RuntimeError("Model tidak menghasilkan output.")

    return results[0]