from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.config import ROOT_DIR
from src.controllers.random_controller import router as random_router
from src.controllers.hash_controller import router as hash_router

FRONTEND_DIST_DIR = ROOT_DIR / "web" / "dist"
# FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"

app = FastAPI(
    title="Security Lab Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://security-lab-birdnero.vercel.app",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(random_router)
app.include_router(hash_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# if FRONTEND_INDEX.exists():
#     @app.get("/", include_in_schema=False)
#     def serve_frontend_root() -> FileResponse:
#         return FileResponse(FRONTEND_INDEX)


#     @app.get("/{full_path:path}", include_in_schema=False)
#     def serve_frontend_spa(full_path: str) -> FileResponse:
#         candidate = FRONTEND_DIST_DIR / full_path
#         if candidate.is_file():
#             return FileResponse(candidate)
#         return FileResponse(FRONTEND_INDEX)
