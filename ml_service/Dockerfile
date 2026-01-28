# Use the official Python image
FROM python:3.9-slim

# Set work directory
WORKDIR /app

# Install system dependencies for spacy and general builds
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Command to run the application
# We use uvicorn and host on 0.0.0.0, port 7860
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "7860"]
