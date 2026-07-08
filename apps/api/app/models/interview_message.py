
from sqlalchemy import DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from datetime import datetime


class InterviewMessage(Base):
  __tablename__ = "interview_messages"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  interview_id: Mapped[str] = mapped_column(Text, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
  role: Mapped[str] = mapped_column(Text, nullable=False)
  content: Mapped[str] = mapped_column(Text, nullable=False)
  round: Mapped[int] = mapped_column(Integer, nullable=False)
  created_at: Mapped[datetime] = mapped_column(DateTime)