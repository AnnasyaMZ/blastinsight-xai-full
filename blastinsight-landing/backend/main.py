import base64
import gc
import shutil
import uuid
from pathlib import Path
from typing import Optional

import cv2

from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware

from inference import run_inference
from fragmentation import analyze_fragmentation
from eigen_cam import generate_eigencam


# ============================================================
# PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# PRODUCTION CONFIG
# ============================================================

# Kalau Railway masih OOM saat Eigen-CAM,
# cukup ubah menjadi False.
#
# Segmentasi, QC, D10/D50/D80, dan DSS akan tetap bekerja.
ENABLE_EIGENCAM = True


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="BlastInsight-XAI API",
    description=(
        "Backend analisis fragmentasi batuan berbasis "
        "YOLO11s-Seg, Quality Control, Eigen-CAM, "
        "dan DSS berbasis D50."
    ),
    version="1.2.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://blastinsight-xai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# IMAGE HELPER
# ============================================================

def image_to_base64(
    image_bgr,
    quality: int = 90,
) -> str:
    """
    Mengubah OpenCV BGR image menjadi Base64 JPEG.
    """

    if image_bgr is None:
        raise ValueError(
            "Image tidak tersedia."
        )

    success, buffer = cv2.imencode(
        ".jpg",
        image_bgr,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            quality,
        ],
    )

    if not success:
        raise RuntimeError(
            "Gagal melakukan encoding gambar."
        )

    encoded = base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")

    return (
        "data:image/jpeg;base64,"
        + encoded
    )


# ============================================================
# DSS
# ============================================================

def evaluate_dss(
    d50: Optional[float],
    lower_target: Optional[float],
    upper_target: Optional[float],
) -> dict:
    """
    Decision Support System BlastInsight-XAI.

    Prinsip utama:
    - D50 = parameter utama keputusan DSS.
    - D10 dan D80 menjadi konteks distribusi.
    - Target D50 harus spesifik operasi.
    - Dampak biaya bersifat indikatif.
    - DSS bukan pengganti keputusan blasting engineer.
    """

    disclaimer = (
        "Rekomendasi merupakan bahan evaluasi bagi "
        "blasting engineer dan bukan instruksi perubahan "
        "parameter peledakan secara otomatis. "
        "Potensi implikasi biaya bersifat indikatif dan "
        "belum merupakan estimasi finansial kuantitatif."
    )

    # ========================================================
    # D50 TIDAK TERSEDIA
    # ========================================================

    if d50 is None:

        recommendation = (
            "Distribusi ukuran belum dapat dievaluasi "
            "karena nilai D50 tidak tersedia."
        )

        return {
            "status": "UNAVAILABLE",
            "position": "UNAVAILABLE",
            "deviation_px": None,

            "interpretation": (
                "Nilai D50 belum tersedia sehingga kondisi "
                "fragmentasi belum dapat dibandingkan "
                "dengan target operasi."
            ),

            "operational_impacts": [],

            "business_impacts": [],

            "recommendations": [
                (
                    "Pastikan hasil segmentasi dan "
                    "Quality Control menghasilkan D50."
                )
            ],

            "recommendation": recommendation,

            "disclaimer": disclaimer,
        }

    # ========================================================
    # TARGET BELUM TERSEDIA
    # ========================================================

    if (
        lower_target is None
        or upper_target is None
    ):

        recommendation = (
            "Nilai D50 telah diperoleh, tetapi evaluasi "
            "DSS memerlukan rentang target D50 "
            "spesifik operasi."
        )

        return {
            "status": "NEEDS_TARGET",
            "position": "TARGET_NOT_SET",
            "deviation_px": None,

            "interpretation": (
                "D50 telah dihitung, tetapi status "
                "fragmentasi belum dapat ditentukan "
                "karena batas target operasi belum lengkap."
            ),

            "operational_impacts": [],

            "business_impacts": [],

            "recommendations": [
                (
                    "Masukkan batas bawah dan batas atas "
                    "target D50 spesifik operasi."
                )
            ],

            "recommendation": recommendation,

            "disclaimer": disclaimer,
        }

    # ========================================================
    # VALIDASI TARGET
    # ========================================================

    if lower_target >= upper_target:
        raise ValueError(
            "lower_target_d50 harus lebih kecil "
            "dari upper_target_d50."
        )

    # ========================================================
    # OVERSIZE
    # ========================================================

    if d50 > upper_target:

        deviation = round(
            float(
                d50 - upper_target
            ),
            2,
        )

        recommendation = (
            "D50 berada di atas batas target operasi. "
            "Fragmentasi mengindikasikan kondisi OVERSIZE. "
            "Blasting engineer dapat mengevaluasi geometri "
            "peledakan, distribusi energi, serta kondisi "
            "geologi sebelum menentukan penyesuaian "
            "desain berikutnya."
        )

        return {
            "status": "OVERSIZE",

            "position": (
                "ABOVE_UPPER_TARGET"
            ),

            "deviation_px": deviation,

            "interpretation": (
                "Nilai D50 berada di atas batas atas target. "
                "Ukuran sentral fragmentasi cenderung lebih "
                "kasar dari target operasi."
            ),

            "operational_impacts": [
                (
                    "Kebutuhan secondary breaking "
                    "berpotensi meningkat."
                ),
                (
                    "Siklus loading dapat menjadi "
                    "lebih panjang."
                ),
                (
                    "Beban dan keausan pada proses crushing "
                    "berpotensi meningkat."
                ),
            ],

            "business_impacts": [
                (
                    "Biaya secondary breaking "
                    "berpotensi meningkat."
                ),
                (
                    "Konsumsi energi pada proses crushing "
                    "berpotensi meningkat."
                ),
                (
                    "Produktivitas loading-hauling "
                    "dapat terdampak."
                ),
                (
                    "Potensi biaya pemeliharaan terkait "
                    "crusher dapat meningkat."
                ),
            ],

            "recommendations": [
                (
                    "Review burden dan spacing berdasarkan "
                    "desain dan kondisi lapangan."
                ),
                (
                    "Evaluasi distribusi serta kecukupan "
                    "energi peledakan."
                ),
                (
                    "Evaluasi kemungkinan optimasi desain "
                    "untuk mengurangi fragmentasi kasar."
                ),
                (
                    "Verifikasi hasil terhadap kondisi "
                    "geologi dan karakteristik massa batuan."
                ),
            ],

            "recommendation": recommendation,

            "disclaimer": disclaimer,
        }

    # ========================================================
    # OVER-BREAKING
    # ========================================================

    if d50 < lower_target:

        deviation = round(
            float(
                lower_target - d50
            ),
            2,
        )

        recommendation = (
            "D50 berada di bawah batas target operasi. "
            "Fragmentasi mengindikasikan kondisi "
            "OVER-BREAKING. Blasting engineer dapat "
            "mengevaluasi geometri peledakan, distribusi "
            "energi, dan potensi backbreak sebelum "
            "menentukan penyesuaian desain berikutnya."
        )

        return {
            "status": "OVER-BREAKING",

            "position": (
                "BELOW_LOWER_TARGET"
            ),

            "deviation_px": deviation,

            "interpretation": (
                "Nilai D50 berada di bawah batas bawah "
                "target. Ukuran sentral fragmentasi "
                "cenderung lebih halus dari target operasi."
            ),

            "operational_impacts": [
                (
                    "Energi peledakan berpotensi "
                    "digunakan secara berlebih."
                ),
                (
                    "Fraksi material halus dapat meningkat."
                ),
                (
                    "Risiko backbreak perlu dievaluasi."
                ),
            ],

            "business_impacts": [
                (
                    "Efisiensi penggunaan energi peledakan "
                    "dapat menurun."
                ),
                (
                    "Biaya peledakan per volume batuan "
                    "berpotensi tidak optimal."
                ),
                (
                    "Potensi biaya tambahan akibat "
                    "pengendalian backbreak perlu "
                    "diperhatikan."
                ),
            ],

            "recommendations": [
                (
                    "Review burden dan spacing berdasarkan "
                    "desain dan kondisi lapangan."
                ),
                (
                    "Evaluasi distribusi dan intensitas "
                    "energi peledakan."
                ),
                (
                    "Evaluasi kemungkinan optimasi geometri "
                    "untuk mengurangi fragmentasi berlebih."
                ),
                (
                    "Verifikasi kondisi geologi dan potensi "
                    "backbreak di lapangan."
                ),
            ],

            "recommendation": recommendation,

            "disclaimer": disclaimer,
        }

    # ========================================================
    # OPTIMAL
    # ========================================================

    recommendation = (
        "D50 berada dalam rentang target fragmentasi "
        "operasi. Hasil dapat digunakan sebagai baseline "
        "evaluasi desain peledakan bersama D10, D80, "
        "Quality Control, dan parameter lapangan lainnya."
    )

    return {
        "status": "OPTIMAL",

        "position": "WITHIN_TARGET",

        "deviation_px": 0.0,

        "interpretation": (
            "Nilai D50 berada di dalam rentang target. "
            "Tidak terdapat indikasi D50 terlalu kasar "
            "maupun terlalu halus terhadap target operasi."
        ),

        "operational_impacts": [
            (
                "Fragmentasi berada dalam rentang "
                "target operasi."
            ),
            (
                "Tidak terdapat indikasi OVERSIZE atau "
                "OVER-BREAKING berdasarkan D50."
            ),
        ],

        "business_impacts": [
            (
                "Berpotensi mendukung kestabilan proses "
                "loading dan crushing."
            ),
            (
                "Hasil dapat digunakan sebagai baseline "
                "evaluasi desain berikutnya."
            ),
        ],

        "recommendations": [
            (
                "Pertahankan konfigurasi sebagai "
                "referensi evaluasi."
            ),
            (
                "Tetap monitor D10, D80, Quality Control, "
                "dan kondisi geologi lapangan."
            ),
            (
                "Bandingkan hasil antar-siklus untuk "
                "melihat konsistensi fragmentasi."
            ),
        ],

        "recommendation": recommendation,

        "disclaimer": disclaimer,
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
        "xai": "Eigen-CAM Layer 16 (P3)",
    }


@app.get("/health")
def health():

    return {
        "status": "ok",
    }


# ============================================================
# ANALYZE ENDPOINT
# ============================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),

    lower_target_d50: Optional[float] = Form(
        None
    ),

    upper_target_d50: Optional[float] = Form(
        None
    ),
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
    Release YOLO Result dari RAM
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
        "image/webp",
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Format file harus JPG, JPEG, "
                "PNG, atau WEBP."
            ),
        )

    # Validasi target sebelum menjalankan model
    if (
        lower_target_d50 is not None
        and upper_target_d50 is not None
        and lower_target_d50
        >= upper_target_d50
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "lower_target_d50 harus lebih kecil "
                "dari upper_target_d50."
            ),
        )

    extension = Path(
        file.filename
        or "image.jpg"
    ).suffix.lower()

    if extension not in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }:

        extension = ".jpg"

    temp_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    temp_path = (
        TEMP_DIR
        / temp_filename
    )

    # Nilai awal untuk cleanup
    result = None
    segmentation_bgr = None
    eigen_result = None

    try:

        # ====================================================
        # SAVE TEMP IMAGE
        # ====================================================

        with temp_path.open(
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

        # ====================================================
        # VALIDASI IMAGE
        # ====================================================

        image_bgr = cv2.imread(
            str(temp_path)
        )

        if image_bgr is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "File gambar tidak "
                    "dapat dibaca."
                ),
            )

        # Gambar OpenCV ini hanya untuk
        # memastikan file valid.
        del image_bgr

        gc.collect()

        print(
            "[ANALYZE] Image validated.",
            flush=True,
        )

        # ====================================================
        # 1. YOLO11s-SEG INFERENCE
        # ====================================================

        print(
            "[ANALYZE] YOLO inference started.",
            flush=True,
        )

        gc.collect()

        result = run_inference(
            str(temp_path)
        )

        print(
            "[ANALYZE] YOLO inference completed.",
            flush=True,
        )

        # ====================================================
        # 2. FRAGMENTATION ANALYSIS
        # ====================================================

        fragmentation = (
            analyze_fragmentation(
                result
            )
        )

        print(
            (
                "[ANALYZE] Fragmentation "
                "analysis completed."
            ),
            flush=True,
        )

        # ====================================================
        # 3. SEGMENTATION VISUAL
        # ====================================================

        segmentation_bgr = (
            result.plot(
                boxes=False,
                labels=False,
                conf=False,
            )
        )

        segmentation_base64 = (
            image_to_base64(
                segmentation_bgr
            )
        )

        # Array hasil plot sudah tidak diperlukan
        del segmentation_bgr
        segmentation_bgr = None

        print(
            (
                "[ANALYZE] Segmentation "
                "image encoded."
            ),
            flush=True,
        )

        # ====================================================
        # BUANG DATA INTERNAL FRAGMENTASI YANG TIDAK
        # DIKIRIM KE FRONTEND
        # ====================================================

        if isinstance(
            fragmentation,
            dict,
        ):

            fragmentation.pop(
                "_fragments",
                None,
            )

            fragmentation.pop(
                "fragments",
                None,
            )

        # ====================================================
        # 4. DSS
        # ====================================================

        # DSS dihitung sebelum Eigen-CAM.
        # Jadi seluruh nilai numerik utama sudah selesai.
        dss = evaluate_dss(
            d50=fragmentation.get(
                "d50_px"
            ),
            lower_target=(
                lower_target_d50
            ),
            upper_target=(
                upper_target_d50
            ),
        )

        print(
            "[ANALYZE] DSS completed.",
            flush=True,
        )

        # ====================================================
        # RELEASE YOLO RESULT BEFORE EIGENCAM
        # ====================================================

        if result is not None:

            del result
            result = None

        gc.collect()

        print(
            (
                "[ANALYZE] YOLO result "
                "released from memory."
            ),
            flush=True,
        )

        # ====================================================
        # 5. EIGEN-CAM
        # ====================================================

        eigen_base64 = None
        eigen_error = None

        if ENABLE_EIGENCAM:

            try:

                print(
                    (
                        "[ANALYZE] Eigen-CAM "
                        "started."
                    ),
                    flush=True,
                )

                gc.collect()

                eigen_result = (
                    generate_eigencam(
                        image_path=str(
                            temp_path
                        ),
                        include_base64=True,
                    )
                )

                if (
                    eigen_result
                    and eigen_result.get(
                        "image_base64"
                    )
                ):

                    eigen_base64 = (
                        "data:image/jpeg;base64,"
                        + eigen_result[
                            "image_base64"
                        ]
                    )

                print(
                    (
                        "[ANALYZE] Eigen-CAM "
                        "completed."
                    ),
                    flush=True,
                )

            except Exception as error:

                eigen_error = str(
                    error
                )

                print(
                    (
                        "[ANALYZE] Eigen-CAM "
                        "skipped:"
                    ),
                    repr(error),
                    flush=True,
                )

            finally:

                if eigen_result is not None:

                    del eigen_result
                    eigen_result = None

                gc.collect()

        else:

            eigen_error = (
                "Eigen-CAM disabled "
                "for production memory safety."
            )

            print(
                (
                    "[ANALYZE] Eigen-CAM disabled."
                ),
                flush=True,
            )

        # ====================================================
        # 6. RESPONSE
        # ====================================================

        print(
            (
                "[ANALYZE] Preparing "
                "API response."
            ),
            flush=True,
        )

        return {
            "success": True,

            # =================================================
            # MODEL
            # =================================================

            "model": {
                "name": "YOLO11s-Seg",
                "input_size": 960,
                "max_detection": 1000,
            },

            # =================================================
            # FRAGMENTATION
            # =================================================

            "fragmentation": {

                "total_detections":
                    fragmentation.get(
                        "total_detections"
                    ),

                "valid_fragments":
                    fragmentation.get(
                        "valid_fragments"
                    ),

                "excluded_fragments":
                    fragmentation.get(
                        "excluded_fragments"
                    ),

                "valid_percentage":
                    fragmentation.get(
                        "valid_percentage"
                    ),

                "d10_px":
                    fragmentation.get(
                        "d10_px"
                    ),

                "d50_px":
                    fragmentation.get(
                        "d50_px"
                    ),

                "d80_px":
                    fragmentation.get(
                        "d80_px"
                    ),

                "unit": "px",
            },

            # =================================================
            # QC
            # =================================================

            "qc": fragmentation.get(
                "qc"
            ),

            # =================================================
            # DISTRIBUTION CURVE
            # =================================================

            "distribution_curve":
                fragmentation.get(
                    "curve",
                    [],
                ),

            # =================================================
            # DSS
            # =================================================

            "dss": {

                "status":
                    dss["status"],

                "d50_px":
                    fragmentation.get(
                        "d50_px"
                    ),

                "lower_target_d50":
                    lower_target_d50,

                "upper_target_d50":
                    upper_target_d50,

                "position":
                    dss["position"],

                "deviation_px":
                    dss["deviation_px"],

                "interpretation":
                    dss[
                        "interpretation"
                    ],

                "operational_impacts":
                    dss[
                        "operational_impacts"
                    ],

                "business_impacts":
                    dss[
                        "business_impacts"
                    ],

                "recommendations":
                    dss[
                        "recommendations"
                    ],

                # Backward compatibility
                "recommendation":
                    dss[
                        "recommendation"
                    ],

                "disclaimer":
                    dss[
                        "disclaimer"
                    ],
            },

            # =================================================
            # EXPLAINABILITY
            # =================================================

            "explainability": {

                "method":
                    "Eigen-CAM",

                "target_layer":
                    16,

                "target_feature":
                    "P3",

                "available":
                    eigen_base64
                    is not None,

                "error":
                    eigen_error,
            },

            # =================================================
            # IMAGES
            # =================================================

            "images": {

                "segmentation":
                    segmentation_base64,

                "eigencam":
                    eigen_base64,
            },
        }

    # ========================================================
    # HTTP ERROR
    # ========================================================

    except HTTPException:

        raise

    # ========================================================
    # VALIDATION ERROR
    # ========================================================

    except ValueError as error:

        print(
            "[ANALYZE] VALUE ERROR:",
            repr(error),
            flush=True,
        )

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    # ========================================================
    # GENERAL ERROR
    # ========================================================

    except Exception as error:

        print(
            "[ANALYZE] ANALYSIS ERROR:",
            repr(error),
            flush=True,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Analisis gagal: "
                + str(error)
            ),
        )

    # ========================================================
    # CLEANUP
    # ========================================================

    finally:

        # Hapus reference object besar
        try:

            if result is not None:
                del result

        except Exception:
            pass

        try:

            if segmentation_bgr is not None:
                del segmentation_bgr

        except Exception:
            pass

        try:

            if eigen_result is not None:
                del eigen_result

        except Exception:
            pass

        # Hapus temporary image
        try:

            if temp_path.exists():
                temp_path.unlink()

        except Exception:
            pass

        # Garbage collection terakhir
        gc.collect()

        print(
            "[ANALYZE] Cleanup completed.",
            flush=True,
        )