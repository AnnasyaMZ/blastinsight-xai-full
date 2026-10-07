import math
from typing import Optional

import cv2
import numpy as np
import pandas as pd


# ============================================================
# BLASTINSIGHT-XAI
# FRAGMENTATION ANALYSIS
# ============================================================

# Sesuai paper final:
# deteksi dengan confidence < 0.40 dikeluarkan pada tahap QC.
QC_CONFIDENCE_THRESHOLD = 0.40


# ============================================================
# 1. CEK FRAGMEN MENYENTUH BATAS CITRA
# ============================================================

def is_edge_touching(
    polygon: np.ndarray,
    image_width: int,
    image_height: int
) -> bool:
    """
    Menentukan apakah polygon fragmen menyentuh batas citra.

    Paper final menyebut fragmen edge-touching dikeluarkan
    karena area fragmen terpotong oleh field-of-view kamera.

    Tidak digunakan margin tambahan karena paper tidak
    menentukan edge margin tertentu.
    """

    if polygon is None or len(polygon) < 3:
        return True

    x = polygon[:, 0]
    y = polygon[:, 1]

    return bool(
        np.any(x <= 0) or
        np.any(y <= 0) or
        np.any(x >= image_width - 1) or
        np.any(y >= image_height - 1)
    )


# ============================================================
# 2. DIAMETER EKUIVALEN
# ============================================================

def calculate_equivalent_diameter(
    area_px2: float
) -> Optional[float]:
    """
    Menghitung relative equivalent diameter:

        Deq = 2 * sqrt(A / pi)

    A dinyatakan dalam pixel^2 sehingga Deq tetap
    merupakan ukuran relatif dalam pixel.
    """

    if area_px2 <= 0:
        return None

    return float(
        2.0 * math.sqrt(
            area_px2 / math.pi
        )
    )


# ============================================================
# 3. EKSTRAKSI METRIK + QUALITY CONTROL
# ============================================================

def extract_fragment_metrics(
    result,
    confidence_threshold: float = QC_CONFIDENCE_THRESHOLD
) -> pd.DataFrame:
    """
    Mengekstrak polygon hasil YOLO11-Seg dan melakukan QC.

    QC paper final:
    1. fragmen menyentuh batas citra -> dikeluarkan
    2. confidence < 0.40 -> dikeluarkan

    Returns
    -------
    DataFrame dengan satu baris per deteksi mentah.
    """

    columns = [
        "fragment_id",
        "confidence",
        "area_px2",
        "equivalent_diameter_px",
        "edge_touching",
        "valid_for_distribution",
        "exclude_reason"
    ]

    if result is None:
        return pd.DataFrame(
            columns=columns
        )

    if (
        result.masks is None or
        result.boxes is None or
        result.boxes.conf is None
    ):
        return pd.DataFrame(
            columns=columns
        )

    if not hasattr(
        result,
        "orig_shape"
    ) or result.orig_shape is None:
        raise ValueError(
            "result.orig_shape tidak tersedia."
        )

    image_height, image_width = (
        result.orig_shape[:2]
    )

    polygons = (
        result.masks.xy
    )

    confidences = (
        result.boxes.conf
        .detach()
        .cpu()
        .numpy()
    )

    total = min(
        len(polygons),
        len(confidences)
    )

    rows = []

    for index in range(total):
        polygon = np.asarray(
            polygons[index],
            dtype=np.float32
        )

        confidence = float(
            confidences[index]
        )

        # Polygon tidak valid
        if (
            polygon.ndim != 2 or
            polygon.shape[0] < 3
        ):
            rows.append({
                "fragment_id": index + 1,
                "confidence": confidence,
                "area_px2": 0.0,
                "equivalent_diameter_px": None,
                "edge_touching": False,
                "valid_for_distribution": False,
                "exclude_reason": "invalid_polygon"
            })

            continue

        # Luas projected area
        area_px2 = float(
            cv2.contourArea(
                polygon
            )
        )

        deq_px = (
            calculate_equivalent_diameter(
                area_px2
            )
        )

        edge_touching = (
            is_edge_touching(
                polygon=polygon,
                image_width=image_width,
                image_height=image_height
            )
        )

        reasons = []

        if area_px2 <= 0:
            reasons.append(
                "invalid_area"
            )

        if edge_touching:
            reasons.append(
                "edge_touching"
            )

        if confidence < confidence_threshold:
            reasons.append(
                "confidence_below_0.40"
            )

        valid = (
            len(reasons) == 0
        )

        rows.append({
            "fragment_id": index + 1,
            "confidence": confidence,
            "area_px2": area_px2,
            "equivalent_diameter_px": deq_px,
            "edge_touching": edge_touching,
            "valid_for_distribution": valid,
            "exclude_reason": (
                ",".join(reasons)
                if reasons
                else None
            )
        })

    return pd.DataFrame(
        rows,
        columns=columns
    )


# ============================================================
# 4. DISTRIBUSI KUMULATIF BERDASARKAN LUAS AREA
# ============================================================

def calculate_size_distribution(
    valid_fragments: pd.DataFrame
) -> dict:
    """
    Menghitung distribusi ukuran fragmentasi relatif.

    Sesuai paper:
    - fragmen diurutkan berdasarkan Deq
    - setiap fragmen diberi bobot berdasarkan projected area
    - cumulative area fraction dihitung
    - D10, D50, D80 diperoleh melalui interpolasi linear

    D10/D50/D80 bukan np.percentile terhadap jumlah fragmen.
    """

    if (
        valid_fragments is None or
        valid_fragments.empty
    ):
        return {
            "d10_px": None,
            "d50_px": None,
            "d80_px": None,
            "curve": []
        }

    df = (
        valid_fragments[
            valid_fragments[
                "equivalent_diameter_px"
            ].notna()
        ]
        .copy()
    )

    if df.empty:
        return {
            "d10_px": None,
            "d50_px": None,
            "d80_px": None,
            "curve": []
        }

    df = df.sort_values(
        by="equivalent_diameter_px"
    ).reset_index(
        drop=True
    )

    total_projected_area = float(
        df["area_px2"].sum()
    )

    if total_projected_area <= 0:
        return {
            "d10_px": None,
            "d50_px": None,
            "d80_px": None,
            "curve": []
        }

    # Fraksi projected area
    df["area_fraction"] = (
        df["area_px2"] /
        total_projected_area
    )

    # Persentase luas kumulatif
    df["cumulative_area_percent"] = (
        df["area_fraction"]
        .cumsum() *
        100.0
    )

    diameters = (
        df[
            "equivalent_diameter_px"
        ]
        .to_numpy(
            dtype=float
        )
    )

    cumulative = (
        df[
            "cumulative_area_percent"
        ]
        .to_numpy(
            dtype=float
        )
    )

    # ========================================================
    # INTERPOLASI LINEAR
    # ========================================================

    d10 = float(
        np.interp(
            10.0,
            cumulative,
            diameters
        )
    )

    d50 = float(
        np.interp(
            50.0,
            cumulative,
            diameters
        )
    )

    d80 = float(
        np.interp(
            80.0,
            cumulative,
            diameters
        )
    )

    curve = []

    for _, row in df.iterrows():
        curve.append({
            "diameter_px": round(
                float(
                    row[
                        "equivalent_diameter_px"
                    ]
                ),
                4
            ),
            "cumulative_area_percent": round(
                float(
                    row[
                        "cumulative_area_percent"
                    ]
                ),
                4
            )
        })

    return {
        "d10_px": round(
            d10,
            2
        ),
        "d50_px": round(
            d50,
            2
        ),
        "d80_px": round(
            d80,
            2
        ),
        "curve": curve
    }


# ============================================================
# 5. FUNGSI UTAMA
# ============================================================

def analyze_fragmentation(
    result,
    confidence_threshold: float = QC_CONFIDENCE_THRESHOLD
) -> dict:
    """
    Pipeline analisis fragmentasi BlastInsight-XAI.

    YOLO11-Seg Result
        -> Polygon Instance Mask
        -> Projected Area
        -> Relative Equivalent Diameter
        -> Quality Control
        -> Cumulative Area Distribution
        -> D10 / D50 / D80
    """

    fragment_df = (
        extract_fragment_metrics(
            result=result,
            confidence_threshold=confidence_threshold
        )
    )

    total_detections = int(
        len(fragment_df)
    )

    if total_detections == 0:
        return {
            "total_detections": 0,
            "valid_fragments": 0,
            "excluded_fragments": 0,
            "valid_percentage": 0.0,

            "d10_px": None,
            "d50_px": None,
            "d80_px": None,

            "unit": "px",

            "curve": [],
            "fragments": []
        }

    valid_df = (
        fragment_df[
            fragment_df[
                "valid_for_distribution"
            ] == True
        ]
        .copy()
    )

    valid_count = int(
        len(valid_df)
    )

    excluded_count = int(
        total_detections -
        valid_count
    )

    valid_percentage = (
        valid_count /
        total_detections *
        100.0
    )

    distribution = (
        calculate_size_distribution(
            valid_df
        )
    )

    # ========================================================
    # QC SUMMARY
    # ========================================================

    edge_touching_count = int(
        fragment_df[
            "edge_touching"
        ].sum()
    )

    low_confidence_count = int(
        (
            fragment_df[
                "confidence"
            ] <
            confidence_threshold
        ).sum()
    )

    # Catatan:
    # satu fragmen dapat termasuk edge_touching sekaligus
    # low-confidence, sehingga dua angka di atas tidak
    # harus dijumlahkan menjadi excluded_fragments.

    # ========================================================
    # JSON-SAFE FRAGMENT LIST
    # ========================================================

    fragments = []

    for row in (
        fragment_df
        .to_dict(
            orient="records"
        )
    ):
        deq = row[
            "equivalent_diameter_px"
        ]

        fragments.append({
            "fragment_id": int(
                row["fragment_id"]
            ),

            "confidence": round(
                float(
                    row["confidence"]
                ),
                4
            ),

            "area_px2": round(
                float(
                    row["area_px2"]
                ),
                4
            ),

            "equivalent_diameter_px": (
                round(
                    float(deq),
                    4
                )
                if deq is not None and
                not pd.isna(deq)
                else None
            ),

            "edge_touching": bool(
                row[
                    "edge_touching"
                ]
            ),

            "valid_for_distribution": bool(
                row[
                    "valid_for_distribution"
                ]
            ),

            "exclude_reason": (
                None
                if pd.isna(
                    row[
                        "exclude_reason"
                    ]
                )
                else row[
                    "exclude_reason"
                ]
            )
        })

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {
        "total_detections": total_detections,

        "valid_fragments": valid_count,

        "excluded_fragments": excluded_count,

        "valid_percentage": round(
            valid_percentage,
            2
        ),

        "qc": {
            "confidence_threshold": float(
                confidence_threshold
            ),

            "edge_touching_excluded": (
                edge_touching_count
            ),

            "low_confidence_excluded": (
                low_confidence_count
            )
        },

        "d10_px": (
            distribution[
                "d10_px"
            ]
        ),

        "d50_px": (
            distribution[
                "d50_px"
            ]
        ),

        "d80_px": (
            distribution[
                "d80_px"
            ]
        ),

        "unit": "px",

        "curve": (
            distribution[
                "curve"
            ]
        ),

        "fragments": fragments
    }


# ============================================================
# 6. OPTIONAL — SIMPAN DETAIL QC KE CSV
# ============================================================

def save_fragment_csv(
    analysis: dict,
    output_path: str
) -> Optional[str]:
    """
    Optional untuk dokumentasi/audit penelitian.
    """

    fragments = analysis.get(
        "fragments",
        []
    )

    if not fragments:
        return None

    df = pd.DataFrame(
        fragments
    )

    df.to_csv(
        output_path,
        index=False
    )

    return output_path