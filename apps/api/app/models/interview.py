from app.models.base import Base
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

class Interview(Base):
  __tablename__ = "interviews"

  id: Mapped[str] = mapped_column(Text, primary_key=True)
  target_role: Mapped[str] = mapped_column(Text, nullable=False)
  tech_stack: Mapped[str] = mapped_column(Text, nullable=False)
  experience_years: Mapped[int] = mapped_column(Integer, nullable=False)
  difficulty: Mapped[str] = mapped_column(Text, nullable=False)
  status: Mapped[str] = mapped_column(Text, nullable=False, default='in_progress')
  current_round: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
  created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
  updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
