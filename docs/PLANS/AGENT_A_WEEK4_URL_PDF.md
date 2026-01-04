# Agent A Week 4 Plan: URL + PDF Recipe Ingestion

## Overview

Extend recipe ingestion to support URLs (recipe websites) and PDFs alongside existing photo upload.

## Tasks

### 1. URL Input Component (`/recipes/new/url/page.tsx`)
- Input field for pasting URL
- URL validation (must be http/https)
- Loading state during fetch
- Error handling for invalid URLs

### 2. URL Scraping Service (`/lib/extraction/url-scraper.ts`)
- Fetch HTML content (with error handling)
- Parse JSON-LD schema.org Recipe data (preferred method)
- Parse common recipe microdata patterns
- Generic HTML extraction fallback

### 3. Site-Specific Handlers (`/lib/extraction/site-handlers/`)
- AllRecipes handler
- NYT Cooking handler
- Food Network handler
- Serious Eats handler
- Generic handler (fallback)

### 4. PDF Upload Component (`/recipes/new/pdf/page.tsx`)
- PDF file picker
- PDF validation (file type, size limits)
- Loading state during processing

### 5. PDF Parsing via Claude Vision (`/lib/extraction/pdf-parser.ts`)
- Convert PDF page to image using pdf.js
- Send image to Claude Vision (reuse existing extraction)
- Support single-page PDFs initially

### 6. Unified Extraction Flow
- All sources (photo, URL, PDF) → ExtractionResult
- All sources → same correction UI
- Update `/recipes/new/page.tsx` to enable URL + PDF cards

## API Endpoints

### `/api/recipes/extract-url` (new)
- POST with `{ url: string }`
- Returns ExtractionResult

### `/api/recipes/extract` (extend)
- Already supports photo
- Add PDF → image conversion logic

## Implementation Order

1. URL scraping service (core logic)
2. Site handlers (JSON-LD + fallback)
3. URL input component + API route
4. PDF parsing service
5. PDF upload component
6. Update main page with active links
7. Verify unified correction flow

## Dependencies to Install

- `cheerio` - HTML parsing
- `pdfjs-dist` - PDF rendering to canvas
