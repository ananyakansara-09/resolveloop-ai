import os
import sys

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath("."))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.session import Base, get_db
from app.db.seed import seed_database
from app.main import app

# In-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_test,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Create all tables on test engine
    Base.metadata.create_all(bind=engine_test)

    # Seed data on test engine
    from app.db import seed
    original_engine = seed.engine
    original_sessionmaker = seed.SessionLocal
    seed.engine = engine_test
    seed.SessionLocal = TestingSessionLocal

    seed_database()

    seed.engine = original_engine
    seed.SessionLocal = original_sessionmaker
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def db():
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
