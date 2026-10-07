import base64
import gc
from pathlib import Path

import cv2
import numpy as np
import torch
from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

# PAKAI MODEL YANG SUDAH DILOAD DI inference.py
from inference import model as shared_yolo_model


# ============================================================
# BLASTINSIGHT-XAI — EIGENCAM CONFIG
# ============================================================

MAX_RAW_DIM = 1600

# Untuk Railway, EigenCAM dibuat lebih hemat RAM
# Segmentasi utama tetap 960 di inference.py
CAM_IMGSZ = 640

# Sesuai hasil eksperimen paper:
# Layer 16 = P3
TARGET_LAYER_INDEX = 16


# ============================================================
# DEVICE
# ============================================================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# ============================================================
# REUSE YOLO MODEL DARI inference.py
# ============================================================

base_model = shared_yolo_model.model.to(DEVICE).eval()


# ============================================================
# SINGLE TENSOR WRAPPER
# ============================================================

class SingleTensorWrapper(torch.nn.Module):
    """
    YOLO11-Seg bisa menghasilkan output tuple/list.
    pytorch-grad-cam membutuhkan satu tensor output.
    """

    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        output = self.model(x)
        while isinstance(output, (list, tuple)):
            output = output[0]
        return output


wrapped_model = SingleTensorWrapper(base_model).to(DEVICE).eval()


# ============================================================
# IMAGE HELPERS
# ============================================================

def resize_if_too_big(image: np.ndarray, max_dim: int = MAX_RAW_DIM):
    """
    Membatasi sisi terpanjang citra agar tidak terlalu besar
    untuk menghemat memori.
    """
    h, w = image.shape[:2]
    longest = max(h, w)

    if longest <= max_dim:
        return image

    scale = max_dim / longest
    new_w = int(w * scale)
    new_h = int(h * scale)

    return cv2.resize(
        image,
        (new_w, new_h),
        interpolation=cv2.INTER_AREA
    )


def image_to_base64(image_rgb: np.ndarray, quality: int = 85):
    """
    Mengubah RGB image menjadi base64 JPEG untuk frontend React.
    """
    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    success, buffer = cv2.imencode(
        ".jpg",
        image_bgr,
        [cv2.IMWRITE_JPEG_QUALITY, quality]
    )

    if not success:
        raise RuntimeError("Gagal encoding EigenCAM image.")

    encoded = base64.b64encode(buffer.tobytes()).decode("utf-8")
    return encoded


# ============================================================
# EIGENCAM
# ============================================================

def generate_eigencam(
    image_path: str,
    save_path: str | None = None,
    include_base64: bool = True
):
    """
    Membuat visualisasi Eigen-CAM menggunakan layer P3 (layer 16).

    Catatan:
    - inference segmentasi utama tetap pakai 960 px
    - EigenCAM dibuat lebih ringan dengan CAM_IMGSZ = 640
    """

    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"Gambar tidak ditemukan: {image_path}")

    image_bgr = cv2.imread(str(image_path))
    if image_bgr is None:
        raise ValueError(f"Gagal membaca gambar: {image_path}")

    image_bgr = resize_if_too_big(image_bgr)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    original_h, original_w = image_rgb.shape[:2]

    # Input khusus EigenCAM (lebih hemat)
    cam_input_rgb = cv2.resize(
        image_rgb,
        (CAM_IMGSZ, CAM_IMGSZ),
        interpolation=cv2.INTER_LINEAR
    )

    cam_input_float = cam_input_rgb.astype(np.float32) / 255.0

    input_tensor = (
        torch.from_numpy(cam_input_float)
        .permute(2, 0, 1)
        .unsqueeze(0)
        .to(DEVICE)
    )

    target_layers = [base_model.model[TARGET_LAYER_INDEX]]

    try:
        with EigenCAM(
            model=wrapped_model,
            target_layers=target_layers
        ) as cam:
            grayscale_cam = cam(
                input_tensor=input_tensor,
                targets=None
            )[0]

        cam_image = show_cam_on_image(
            cam_input_float,
            grayscale_cam,
            use_rgb=True
        )

        saved_path = None
        if save_path:
            save_path = Path(save_path)
            save_path.parent.mkdir(parents=True, exist_ok=True)

            cam_bgr = cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(save_path), cam_bgr)
            saved_path = str(save_path)

        encoded = None
        if include_base64:
            encoded = image_to_base64(cam_image)

        return {
            "method": "Eigen-CAM",
            "target_layer": TARGET_LAYER_INDEX,
            "target_feature": "P3",
            "input_size": CAM_IMGSZ,
            "original_width": int(original_w),
            "original_height": int(original_h),
            "image_base64": encoded,
            "saved_path": saved_path
        }

    finally:
        del input_tensor
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()