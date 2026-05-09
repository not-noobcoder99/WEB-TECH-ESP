FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Environment variables
ENV FLASK_ENV=production
ENV PORT=8000

# Run application with Gunicorn (shell form so $PORT is expanded at runtime)
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 app:app
