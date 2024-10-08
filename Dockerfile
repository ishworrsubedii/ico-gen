FROM python:3.10-slim

WORKDIR /ico-gen

COPY icogen_core /ico-gen/icogen_core
COPY main.py /ico-gen
COPY requirements.txt /ico-gen
COPY setup.py /ico-gen


RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    ffmpeg \
    libsm6 \
    libxext6 \
    build-essential \
    git \
    && apt-get clean

RUN pip install --no-cache-dir --upgrade pip==23.0
RUN pip install --no-cache-dir -r requirements.txt


RUN python setup.py sdist bdist_wheel
RUN pip install dist/*.whl


EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
