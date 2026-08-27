# Apply the medallion seed (Bronze -> Silver) once and exit.
FROM python:3.13-slim

WORKDIR /seed

COPY ops/seed/requirements.txt /seed/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY db/seed /seed
COPY docs/seed.json /seed/seed.json

ENV PYTHONUNBUFFERED=1 \
    SEED_JSON_PATH=/seed/seed.json

CMD ["python", "seed.py"]
