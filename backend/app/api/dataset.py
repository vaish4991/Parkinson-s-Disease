from fastapi import APIRouter

router = APIRouter()


@router.get("/dataset-stats")
def get_dataset_stats():
    return {
        "total_images": 204,
        "splits": {
            "train": {"total": 133, "healthy": 65, "parkinson": 68},
            "validation": {"total": 31, "healthy": 19, "parkinson": 12},
            "test": {"total": 40, "healthy": 18, "parkinson": 22},
        },
        "classes": {
            "healthy": {"total": 102, "label": 0},
            "parkinson": {"total": 102, "label": 1},
        },
        "image_size": "224×224 (after resize)",
        "original_format": "RGB JPEG",
        "class_balance": "balanced (1:1)",
        "dataset_note": (
            "Filename prefixes (V01, V02...) may indicate participants. "
            "Cross-split image-level overlap possible."
        ),
    }
