from fastapi import APIRouter
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse
from app.services.interviews_service import create_interview_service

router = APIRouter()

@router.post("/interviews", response_model=CreateInterviewResponse)
def create_interview(data: CreateInterviewRequest):
  return create_interview_service(data)