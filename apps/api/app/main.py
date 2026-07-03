
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.health import router as health_router
from app.routes.interviews import router as interviews_router
from app.routes.chat import router as chat_router


app = FastAPI(title="xin-offer")

# 配置CORS中间件,允许所有跨域请求.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 允许所有来源.
    allow_credentials=True, # 允许携带cookie等认证信息.
    allow_methods=["*"], # 允许所有http方法.
    allow_headers=["*"], # 允许所有http请求头.
)

app.include_router(health_router)
app.include_router(interviews_router)
app.include_router(chat_router)