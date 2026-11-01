from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Brand, gen_uuid
from backend.app.schemas import BrandCreate, BrandOut
from backend.app.auth import get_current_user

router = APIRouter(prefix="/brands", tags=["brands"])

@router.get("", response_model=List[BrandOut])
def get_brands(db: Session = Depends(get_db)):
    return db.query(Brand).all()

@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(brand_id: str, db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == brand_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Brand not found")
    return b

@router.post("", response_model=BrandOut)
def create_brand(brand: BrandCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    new_brand = Brand(
        id=gen_uuid("brand-"),
        name=brand.name,
        description=brand.description
    )
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand
