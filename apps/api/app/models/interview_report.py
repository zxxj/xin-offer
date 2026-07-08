from app.models.base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Text, ForeignKey, DateTime
from datetime import datetime


class InterviewReport(Base):
  __tablename__ = "interview_reports"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  interview_id: Mapped[str] = mapped_column(Text, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
  score: Mapped[int] = mapped_column(Integer, nullable=False)
  strengths: Mapped[str] = mapped_column(Text, nullable=False)
  weaknesses: Mapped[str] = mapped_column(Text, nullable=False)
  suggestions: Mapped[str] = mapped_column(Text, nullable=False)
  created_at: Mapped[datetime] = mapped_column(DateTime)