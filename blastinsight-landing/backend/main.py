import base64
import shutil
import uuid
from pathlib import Path
from typing import Optional

import cv2
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from inference import run_inference
from fragmentation import analyze_fragmentation
from eigen_cam import generate_eigencam


# ============================================================
# PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="BlastInsight-XAI API",
    description="Backend analisis fragmentasi batuan berbasis YOLO11s-Seg dan Eigen-CAM.",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://blastinsight-xai.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# IMAGE HELPER
# ============================================================

def image_to_base64(image_bgr) -> str:
    """
    Mengubah OpenCV BGR image menjadi Base64 JPEG.
    """

    if image_bgr is None:
        raise ValueError("Image tidak tersedia.")

    success, buffer = cv2.imencode(
        ".jpg",
        image_bgr,
        [cv2.IMWRITE_JPEG_QUALITY, 90]
    )

    if not success:
        raise RuntimeError("Gagal melakukan encoding gambar.")

    encoded = base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")

    return f"data:image/jpeg;base64,{encoded}"


# ============================================================
# DSS
# ============================================================

def evaluate_dss(
    d50: Optional[float],
    lower_target: Optional[float],
    upper_target: Optional[float]
) -> dict:
    """
    DSS mengikuti paper final.

    D50 merupakan parameter utama.
    D10 dan D80 tetap menjadi informasi pendukung.

    Threshold tidak dibuat universal.
    lower_target dan upper_target harus berasal dari
    target fragmentasi spesifik operasi.
    """

    if d50 is None:
        return {
            "status": "UNAVAILABLE",
            "recommendation": (
                "Distribusi ukuran belum dapat dievaluasi karena "
                "nilai D50 tidak tersedia."
            )
        }

    if lower_target is None or upper_target is None:
        return {
            "status": "NEEDS_TARGET",
            "recommendation": (
                "Nilai D50 telah diperoleh, tetapi klasifikasi "
                "OVERSIZE, OPTIMAL, atau OVER-BREAKING memerlukan "
                "rentang target D50 spesifik operasi."
            )
        }

    if lower_target >= upper_target:
        raise ValueError(
            "lower_target_d50 harus lebih kecil dari upper_target_d50."
        )

    # ========================================================
    # OVERSIZE
    # ========================================================

    if d50 > upper_target:
        return {
            "status": "OVERSIZE",
            "recommendation": (
                "D50 berada di atas batas target operasi. "
                "Kondisi mengindikasikan fragmentasi relatif lebih kasar. "
                "Blasting engineer dapat mempertimbangkan evaluasi "
                "geometri peledakan atau distribusi energi pada siklus "
                "berikutnya."
            )
        }

    # ========================================================
    # OVER-BREAKING
    # ========================================================

    if d50 < lower_target:
        return {
            "status": "OVER-BREAKING",
            "recommendation": (
                "D50 berada di bawah batas target operasi. "
                "Kondisi mengindikasikan fragmentasi relatif terlalu halus. "
                "Blasting engineer dapat mempertimbangkan evaluasi "
                "geometri peledakan dan distribusi energi untuk "
                "menghindari fragmentasi berlebih."
            )
        }

    # ========================================================
    # OPTIMAL
    # ========================================================

    return {
        "status": "OPTIMAL",
        "recommendation": (
            "D50 berada dalam rentang target fragmentasi operasi. "
            "Hasil dapat digunakan sebagai informasi pendukung "
            "evaluasi desain peledakan bersama parameter lapangan lainnya."
        )
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "service": "BlastInsight-XAI API",
        "status": "online",
        "model": "YOLO11s-Seg",
        "xai": "Eigen-CAM Layer 16 (P3)"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ============================================================
# ANALYZE ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),

    # Optional:
    # target fragmentasi spesifik operasi
    lower_target_d50: Optional[float] = Form(None),
    upper_target_d50: Optional[float] = Form(None)
):
    """
    Pipeline utama:

    Upload Image
        ↓
    YOLO11s-Seg
        ↓
    Polygon Instance Mask
        ↓
    Fragmentation QC
        ↓
    D10 / D50 / D80
        ↓
    Eigen-CAM Layer 16 / P3
        ↓
    DSS berdasarkan D50
        ↓
    JSON + Base64
    """

    # ========================================================
    # VALIDASI FILE
    # ========================================================

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Format file harus JPG, JPEG, PNG, atau WEBP."
        )

    extension = Path(
        file.filename or "image.jpg"
    ).suffix.lower()

    if extension not in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }:
        extension = ".jpg"

    temp_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    temp_path = (
        TEMP_DIR / temp_filename
    )

    # ========================================================
    # SAVE TEMP IMAGE
    # ========================================================

    try:
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        image_bgr = cv2.imread(
            str(temp_path)
        )

        if image_bgr is None:
            raise HTTPException(
                status_code=400,
                detail="File gambar tidak dapat dibaca."
            )

        # ====================================================
        # 1. YOLO11s-SEG INFERENCE
        # ====================================================

        result = run_inference(
            str(temp_path)
        )

        # ====================================================
        # 2. FRAGMENTATION ANALYSIS
        # ====================================================

        fragmentation = analyze_fragmentation(
            result
        )

        # ====================================================
        # 3. SEGMENTATION VISUAL
        # ====================================================

        segmentation_bgr = result.plot(
            boxes=False,
            labels=False,
            conf=False
        )

    
        segmentation_base64 = (
            image_to_base64(
                segmentation_bgr
            )
        )

        # ====================================================
        # 4. EIGEN-CAM P3
        # ====================================================

        eigen_result = generate_eigencam(
            image_path=str(temp_path),
            include_base64=True
        )

        eigen_base64 = None

        if eigen_result.get(
            "image_base64"
        ):
            eigen_base64 = (
                "data:image/jpeg;base64,"
                + eigen_result[
                    "image_base64"
                ]
            )

        # ====================================================
        # 5. DSS
        # ====================================================

        dss = evaluate_dss(
            d50=fragmentation.get(
                "d50_px"
            ),
            lower_target=lower_target_d50,
            upper_target=upper_target_d50
        )

        # ====================================================
        # 6. RESPONSE
        # ====================================================

        return {
            "success": True,

            "model": {
                "name": "YOLO11s-Seg",
                "input_size": 960,
                "max_detection": 1000
            },

            "fragmentation": {
                "total_detections": fragmentation.get(
                    "total_detections"
                ),

                "valid_fragments": fragmentation.get(
                    "valid_fragments"
                ),

                "excluded_fragments": fragmentation.get(
                    "excluded_fragments"
                ),

                "valid_percentage": fragmentation.get(
                    "valid_percentage"
                ),

                "d10_px": fragmentation.get(
                    "d10_px"
                ),

                "d50_px": fragmentation.get(
                    "d50_px"
                ),

                "d80_px": fragmentation.get(
                    "d80_px"
                ),

                "unit": "px"
            },

            "qc": fragmentation.get(
                "qc"
            ),

            "distribution_curve": fragmentation.get(
                "curve",
                []
            ),

            "dss": {
                "status": dss[
                    "status"
                ],

                "d50_px": fragmentation.get(
                    "d50_px"
                ),

                "lower_target_d50": lower_target_d50,

                "upper_target_d50": upper_target_d50,

                "recommendation": dss[
                    "recommendation"
                ]
            },

            "explainability": {
                "method": "Eigen-CAM",
                "target_layer": 16,
                "target_feature": "P3"
            },

            "images": {
                "segmentation": segmentation_base64,
                "eigencam": eigen_base64
            },

        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(
            "ANALYSIS ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Analisis gagal: {str(error)}"
        )

    finally:
        # ====================================================
        # CLEAN TEMP FILE
        # ====================================================

        try:
            if temp_path.exists():
                temp_path.unlink()
        except Exception:
            pass