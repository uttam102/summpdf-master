#!/bin/bash

echo "======================================"
echo "SummPDF White Screen Debug Test"
echo "======================================"
echo ""

echo "Testing Backend API..."
echo "----------------------"
RESPONSE=$(curl -s http://localhost:8080/api/summaries/item/69d4b7ca25a3218d6f86dddf 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "✓ Backend API is responding"
  echo "  Response preview:"
  echo "$RESPONSE" | head -5 | sed 's/^/  /'
else
  echo "✗ Backend API error: $RESPONSE"
  exit 1
fi

echo ""
echo "Testing Frontend..."
echo "-------------------"
echo "Please check your browser:"
echo "1. Open Chrome/Firefox"
echo "2. Press F12 (open DevTools)"
echo "3. Go to Console tab"
echo "4. Visit: http://localhost:5173/summaries/69d4b7ca25a3218d6f86dddf"
echo "5. Send me a screenshot of any errors in Console/Network tabs"
echo ""
echo "What errors you'll see in Console will tell me exactly what failed!"
echo ""
