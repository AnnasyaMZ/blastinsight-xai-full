import base64
import gc
from pathlib import Path

import cv2
import numpy as np
import torch
from ultralytics import YOLO
from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image


# ============================================================
# BLASTINSIGHT-XAI — EIGENCAM CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best.pt"

IMGSZ = 960
MAX_RAW_DIM = 2000

# Sesuai hasil eksperimen paper:
# Layer 16 = P3
TARGET_LAYER_INDEX = 16


# ============================================================
# DEVICE
# ============================================================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# ============================================================
# LOAD YOLO MODEL
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model tidak ditemukan: {MODEL_PATH}"
    )

yolo_model = YOLO(str(MODEL_PATH))

base_model = (
    yolo_model
    .model
    .to(DEVICE)
    .eval()
)


# ============================================================
# SINGLE TENSOR WRAPPER
# ============================================================

class SingleTensorWrapper(torch.nn.Module):
    """
    YOLO11-Seg dapat menghasilkan output tuple/list.

    pytorch-grad-cam membutuhkan output tensor tunggal.
    Wrapper ini mengambil tensor utama tanpa mengubah
    arsitektur internal model.
    """

    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        output = self.model(x)

        while isinstance(
            output,
            (list, tuple)
        ):
            output = output[0]

        return output


wrapped_model = (
    SingleTensorWrapper(
        base_model
    )
    .to(DEVICE)
    .eval()
)


# ============================================================
# IMAGE HELPERS
# ============================================================

def resize_if_too_big(
    image: np.ndarray,
    max_dim: int = MAX_RAW_DIM
):
    """
    Membatasi sisi terpanjang citra hingga maksimum 2000 px.
    """

    height, width = image.shape[:2]

    if max(height, width) <= max_dim:
        return image

    scale = (
        max_dim /
        max(height, width)
    )

    new_width = int(
        width * scale
    )

    new_height = int(
        height * scale
    )

    return cv2.resize(
        image,
        (
            new_width,
            new_height
        ),
        interpolation=cv2.INTER_AREA
    )


def image_to_base64(
    image_rgb: np.ndarray,
    quality: int = 90
):
    """
    Mengubah RGB image menjadi Base64 JPEG
    agar dapat langsung dikirim melalui JSON ke React.
    """

    image_bgr = cv2.cvtColor(
        image_rgb,
        cv2.COLOR_RGB2BGR
    )

    success, buffer = cv2.imencode(
        ".jpg",
        image_bgr,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            quality
        ]
    )

    if not success:
        raise RuntimeError(
            "Gagal melakukan encoding EigenCAM."
        )

    encoded = base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")

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
    Membuat visualisasi Eigen-CAM menggunakan
    Layer 16 / P3 YOLO11s-Seg.

    Parameters
    ----------
    image_path:
        Path gambar asli.

    save_path:
        Optional. Jika diisi, hasil heatmap disimpan
        sebagai file JPEG/PNG.

    include_base64:
        Jika True, hasil juga dikembalikan dalam Base64
        untuk dikirim ke frontend melalui JSON.

    Returns
    -------
    dict
    """

    image_path = Path(
        image_path
    )

    if not image_path.exists():
        raise FileNotFoundError(
            f"Gambar tidak ditemukan: {image_path}"
        )

    # ========================================================
    # LOAD IMAGE
    # ========================================================

    image_bgr = cv2.imread(
        str(image_path)
    )

    if image_bgr is None:
        raise ValueError(
            f"Gambar gagal dibaca: {image_path}"
        )

    # Sesuai preprocessing penelitian
    image_bgr = resize_if_too_big(
        image_bgr
    )

    image_rgb = cv2.cvtColor(
        image_bgr,
        cv2.COLOR_BGR2RGB
    )

    original_height, original_width = (
        image_rgb.shape[:2]
    )

    # ========================================================
    # MODEL INPUT
    # ========================================================

    image_resized = cv2.resize(
        image_rgb,
        (
            IMGSZ,
            IMGSZ
        ),
        interpolation=cv2.INTER_LINEAR
    )

    image_float = (
        image_resized.astype(
            np.float32
        ) / 255.0
    )

    input_tensor = (
        torch
        .from_numpy(
            image_float
        )
        .permute(
            2,
            0,
            1
        )
        .unsqueeze(0)
        .to(DEVICE)
    )

    # ========================================================
    # TARGET LAYER
    # Layer 16 = P3
    # ========================================================

    target_layers = [
        base_model.model[
            TARGET_LAYER_INDEX
        ]
    ]

    # ========================================================
    # GENERATE EIGENCAM
    # ========================================================

    try:
        with torch.no_grad():
            with EigenCAM(
                model=wrapped_model,
                target_layers=target_layers
            ) as cam:

                grayscale_cam = cam(
                    input_tensor=input_tensor,
                    targets=None
                )[0]

        # ====================================================
        # OVERLAY HEATMAP
        # ====================================================

        cam_image = show_cam_on_image(
            image_float,
            grayscale_cam,
            use_rgb=True
        )

        # ====================================================
        # SIMPAN FILE OPTIONAL
        # ====================================================

        saved_path = None

        if save_path:
            save_path = Path(
                save_path
            )

            save_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            cam_bgr = cv2.cvtColor(
                cam_image,
                cv2.COLOR_RGB2BGR
            )

            cv2.imwrite(
                str(save_path),
                cam_bgr
            )

            saved_path = str(
                save_path
            )

        # ====================================================
        # BASE64
        # ====================================================

        encoded = None

        if include_base64:
            encoded = image_to_base64(
                cam_image
            )

        return {
            "method": "Eigen-CAM",
            "target_layer": TARGET_LAYER_INDEX,
            "target_feature": "P3",
            "input_size": IMGSZ,
            "original_width": int(
                original_width
            ),
            "original_height": int(
                original_height
            ),
            "image_base64": encoded,
            "saved_path": saved_path
        }

    finally:
        del input_tensor

        gc.collect()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()