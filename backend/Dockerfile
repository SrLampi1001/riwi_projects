# Bioma backend image — Python 3.13 slim.
#
# Multi-stage build keeps the runtime image small and avoids needing a
# build toolchain in production.

FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install runtime deps first so the layer is cached when only source changes.
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Application source.
COPY app /app/app

# Test deps (pytest + pytest-asyncio + httpx are in requirements.txt too).
# Installing them keeps the image runnable as a self-contained test target;
# the image is local-dev only, so this is acceptable.
COPY tests /app/tests
COPY pytest.ini /app/pytest.ini

# Run as a non-root user.
RUN useradd --create-home --shell /bin/bash bioma && chown -R bioma:bioma /app
USER bioma

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request,sys; \
sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=2).status == 200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]