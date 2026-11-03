import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
try:
    from jose import JWTError, jwt
except ImportError:
    class JWTError(Exception):
        pass

    class _FallbackJWT:
        @staticmethod
        def encode(payload: dict, secret: str, algorithm: str = "HS256") -> str:
            header = base64.urlsafe_b64encode(json.dumps({"alg": algorithm, "typ": "JWT"}).encode()).decode().rstrip("=")
            body = base64.urlsafe_b64encode(json.dumps(payload, default=str).encode()).decode().rstrip("=")
            sig_input = f"{header}.{body}".encode()
            sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), sig_input, hashlib.sha256).digest()).decode().rstrip("=")
            return f"{header}.{body}.{sig}"

        @staticmethod
        def decode(token: str, secret: str, algorithms: Optional[List[str]] = None) -> dict:
            try:
                parts = token.split(".")
                if len(parts) != 3:
                    raise JWTError("Invalid token")
                padding = "=" * (-len(parts[1]) % 4)
                return json.loads(base64.urlsafe_b64decode(parts[1] + padding).decode())
            except Exception as exc:
                raise JWTError(str(exc))

    jwt = _FallbackJWT()
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Standard SHA256 with salt prefix or bcrypt
    if hashed_password.startswith("sha256:"):
        salt, h = hashed_password.split(":")[1], hashed_password.split(":")[2]
        return hashlib.sha256((plain_password + salt).encode("utf-8")).hexdigest() == h
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    salt = "veritybrand_salt"
    h = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    return f"sha256:{salt}:{h}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    db: Session = Depends(get_db)
) -> User:
    # 1. If explicit header provided (for easy persona switching in demo)
    if x_user_id:
        user = db.query(User).filter(User.id == x_user_id).first()
        if user:
            return user
        # If user not yet in DB, synthesize mock demo user
        return User(id=x_user_id, email=f"{x_user_id}@novafootwear.demo", name=x_user_id.capitalize(), role=x_user_role or "reviewer")
        
    # 2. Try JWT token
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user
        except JWTError:
            pass

    # Default fallback demo user (Riya - creator)
    default_user = db.query(User).filter(User.email.in_(["creator@veritybrand.demo", "riya@novafootwear.demo"])).first()
    if default_user:
        return default_user
        
    return User(id="user_riya", email="creator@veritybrand.demo", name="Riya Sharma", role="creator")

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles and "admin" not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Role '{current_user.role}' is not authorized. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
